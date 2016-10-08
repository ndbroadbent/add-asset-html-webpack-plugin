// @flow

import path from 'path';
import crypto from 'crypto';
import BPromise from 'bluebird';

import type { AssetType, ArrayOfAssetsType, WebpackCompilationType, Callback } from '../types';

function ensureTrailingSlash(string: ?string): string {
  if (string && string.length && string.substr(-1, 1) !== '/') {
    return `${string}/`;
  }

  return string || '';
}

// Copied from html-webpack-plugin
function resolvePublicPath(compilation: Object, filename: string): string {
  /* istanbul ignore else */
  const publicPath: string = typeof compilation.options.output.publicPath !== 'undefined'
    ? compilation.options.output.publicPath
    : path.relative(path.dirname(filename), '.'); // TODO: How to test this? I haven't written this logic, unsure what it does

  return ensureTrailingSlash(publicPath);
}

function resolveOutput(compilation: Object, addedFilename: string, outputPath: ?string) {
  if (outputPath && outputPath.length) {
    /* eslint-disable no-param-reassign */
    compilation.assets[`${outputPath}/${addedFilename}`] = compilation.assets[addedFilename];
    delete compilation.assets[addedFilename];
    /* eslint-enable */
  }
}

async function addFileToAssets(
  compilation: WebpackCompilationType,
  htmlPluginData: Object,
  { filepath, typeOfAsset = 'js', includeSourcemap = true, hash = false, publicPath, outputPath }: AssetType
): Promise<void> {
  if (!filepath) {
    const error = new Error('No filepath defined');
    compilation.errors.push(error);
    return Promise.reject(error);
  }

  const addedFilename: string = await htmlPluginData.plugin.addFileToAssets(filepath, compilation);

  let suffix = '';
  if (hash) {
    const md5 = crypto.createHash('md5');
    md5.update(compilation.assets[addedFilename].source());
    suffix = `?${md5.digest('hex').substr(0, 20)}`;
  }

  const resolvedPublicPath = typeof publicPath === 'undefined'
    ? resolvePublicPath(compilation, addedFilename)
    : ensureTrailingSlash(publicPath);
  const resolvedPath = `${resolvedPublicPath}${addedFilename}${suffix}`;

  htmlPluginData.assets[typeOfAsset].unshift(resolvedPath);

  resolveOutput(compilation, addedFilename, outputPath);

  if (includeSourcemap) {
    const addedMapFilename: string = await htmlPluginData.plugin.addFileToAssets(`${filepath}.map`, compilation);
    resolveOutput(compilation, addedMapFilename, outputPath);
  }

  return Promise.resolve();
}

// Visible for testing
export default async function(
  assets: ArrayOfAssetsType,
  compilation: WebpackCompilationType,
  htmlPluginData: Object,
  callback: Callback<any>
) {
  try {
    await BPromise.mapSeries(assets, asset => addFileToAssets(compilation, htmlPluginData, asset));

    callback(null, htmlPluginData);
  } catch (e) {
    callback(e, htmlPluginData);
  }
}
