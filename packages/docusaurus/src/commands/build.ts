/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import chalk from 'chalk';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import fs from 'fs-extra';
import path from 'path';
import ReactLoadableSSRAddon from 'react-loadable-ssr-addon-v5-slorber';
import {Configuration} from 'webpack';
import {BundleAnalyzerPlugin} from 'webpack-bundle-analyzer';
import merge from 'webpack-merge';
import {STATIC_DIR_NAME} from '../constants';
import {load, loadContext} from '../server';
import {handleBrokenLinks} from '../server/brokenLinks';

import {BuildCLIOptions, Props} from '@docusaurus/types';
import createClientConfig from '../webpack/client';
import createServerConfig from '../webpack/server';
import {
  applyConfigurePostCss,
  applyConfigureWebpack,
  compile,
} from '../webpack/utils';
import CleanWebpackPlugin from '../webpack/plugins/CleanWebpackPlugin';
import {loadI18n} from '../server/i18n';
import {mapAsyncSequencial} from '@docusaurus/utils';

export default async function build(
  siteDir: string,
  cliOptions: Partial<BuildCLIOptions> = {},

  // TODO what's the purpose of this arg ?
  forceTerminate: boolean = true,
): Promise<string> {
  ['SIGINT', 'SIGTERM'].forEach((sig) => {
    process.on(sig, () => process.exit());
  });

  async function tryToBuildLocale({
    locale,
    isLastLocale,
  }: {
    locale: string;
    isLastLocale: boolean;
  }) {
    try {
      // console.log(chalk.green(`Site successfully built in locale=${locale}`));
      return await buildLocale({
        siteDir,
        locale,
        cliOptions,
        forceTerminate,
        isLastLocale,
      });
    } catch (e) {
      console.error(`Unable to build website for locale "${locale}".`);
      throw e;
    }
  }
  const context = await loadContext(siteDir, {
    customOutDir: cliOptions.outDir,
    customConfigFilePath: cliOptions.config,
    locale: cliOptions.locale,
    localizePath: cliOptions.locale ? false : undefined,
  });
  const i18n = await loadI18n(context.siteConfig, {
    locale: cliOptions.locale,
  });
  if (cliOptions.locale) {
    return tryToBuildLocale({locale: cliOptions.locale, isLastLocale: true});
  } else {
    if (i18n.locales.length > 1) {
      console.log(
        chalk.yellow(
          `\nWebsite will be built for all these locales:
- ${i18n.locales.join('\n- ')}`,
        ),
      );
    }

    // We need the default locale to always be the 1st in the list
    // If we build it last, it would "erase" the localized sites built in subfolders
    const orderedLocales: string[] = [
      i18n.defaultLocale,
      ...i18n.locales.filter((locale) => locale !== i18n.defaultLocale),
    ];

    const results = await mapAsyncSequencial(orderedLocales, (locale) => {
      const isLastLocale =
        orderedLocales.indexOf(locale) === orderedLocales.length - 1;
      return tryToBuildLocale({locale, isLastLocale});
    });
    return results[0];
  }
}

async function buildLocale({
  siteDir,
  locale,
  cliOptions,
  forceTerminate,
  isLastLocale,
}: {
  siteDir: string;
  locale: string;
  cliOptions: Partial<BuildCLIOptions>;
  forceTerminate: boolean;
  isLastLocale: boolean;
}): Promise<string> {
  process.env.BABEL_ENV = 'production';
  process.env.NODE_ENV = 'production';
  console.log(
    chalk.blue(`\n[${locale}] Creating an optimized production build...`),
  );

  const props: Props = await load(siteDir, {
    customOutDir: cliOptions.outDir,
    customConfigFilePath: cliOptions.config,
    locale,
    localizePath: cliOptions.locale ? false : undefined,
  });

  // Apply user webpack config.
  const {
    outDir,
    generatedFilesDir,
    plugins,
    siteConfig: {baseUrl, onBrokenLinks},
    routes,
  } = props;

  const clientManifestPath = path.join(
    generatedFilesDir,
    'client-manifest.json',
  );
  let clientConfig: Configuration = merge(
    createClientConfig(props, cliOptions.minify),
    {
      plugins: [
        // Remove/clean build folders before building bundles.
        new CleanWebpackPlugin({verbose: false}),
        // Visualize size of webpack output files with an interactive zoomable treemap.
        cliOptions.bundleAnalyzer && new BundleAnalyzerPlugin(),
        // Generate client manifests file that will be used for server bundle.
        new ReactLoadableSSRAddon({
          filename: clientManifestPath,
        }),
      ].filter(Boolean),
    },
  );

  const allCollectedLinks: Record<string, string[]> = {};

  let serverConfig: Configuration = createServerConfig({
    props,
    onLinksCollected: (staticPagePath, links) => {
      allCollectedLinks[staticPagePath] = links;
    },
  });

  const staticDir = path.resolve(siteDir, STATIC_DIR_NAME);
  if (await fs.pathExists(staticDir)) {
    serverConfig = merge(serverConfig, {
      plugins: [
        new CopyWebpackPlugin({
          patterns: [
            {
              from: staticDir,
              to: outDir,
            },
          ],
        }),
      ],
    });
  }

  // Plugin Lifecycle - configureWebpack and configurePostCss.
  plugins.forEach((plugin) => {
    const {configureWebpack, configurePostCss} = plugin;

    if (configurePostCss) {
      clientConfig = applyConfigurePostCss(configurePostCss, clientConfig);
    }

    if (configureWebpack) {
      clientConfig = applyConfigureWebpack(
        configureWebpack.bind(plugin), // The plugin lifecycle may reference `this`. // TODO remove this implicit api: inject in callback instead
        clientConfig,
        false,
        props.siteConfig.webpack?.jsLoader,
        plugin.content,
      );

      serverConfig = applyConfigureWebpack(
        configureWebpack.bind(plugin), // The plugin lifecycle may reference `this`. // TODO remove this implicit api: inject in callback instead
        serverConfig,
        true,
        props.siteConfig.webpack?.jsLoader,
        plugin.content,
      );
    }
  });

  // Make sure generated client-manifest is cleaned first so we don't reuse
  // the one from previous builds.
  if (await fs.pathExists(clientManifestPath)) {
    await fs.unlink(clientManifestPath);
  }

  // Run webpack to build JS bundle (client) and static html files (server).
  await compile([clientConfig, serverConfig]);

  // Remove server.bundle.js because it is not needed.
  if (
    serverConfig.output &&
    serverConfig.output.filename &&
    typeof serverConfig.output.filename === 'string'
  ) {
    const serverBundle = path.join(outDir, serverConfig.output.filename);
    if (await fs.pathExists(serverBundle)) {
      await fs.unlink(serverBundle);
    }
  }

  // Plugin Lifecycle - postBuild.
  await Promise.all(
    plugins.map(async (plugin) => {
      if (!plugin.postBuild) {
        return;
      }
      await plugin.postBuild(props);
    }),
  );

  await handleBrokenLinks({
    allCollectedLinks,
    routes,
    onBrokenLinks,
    outDir,
    baseUrl,
  });

  console.log(
    `${chalk.green(`Success!`)} Generated static files in "${chalk.cyan(
      path.relative(process.cwd(), outDir),
    )}".`,
  );

  if (isLastLocale) {
    console.log(
      `\nUse ${chalk.greenBright(
        '`npm run serve`',
      )} command to test your build locally.\n`,
    );
  }

  if (forceTerminate && isLastLocale && !cliOptions.bundleAnalyzer) {
    process.exit(0);
  }

  return outDir;
}
