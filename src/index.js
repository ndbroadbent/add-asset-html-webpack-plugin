// @flow

import addAllAssetsToCompilation from './addAllAssetsToCompilation';

import type { Callback, AssetType, ArrayOfAssetsType, WebpackCompilerType, WebpackCompilationType } from '../types';

export default class AddAssetHtmlPlugin {
  assets: ArrayOfAssetsType;

  constructor(assets: ArrayOfAssetsType | AssetType | Object = []) {
    this.assets = Array.isArray(assets) ? assets.slice().reverse() : [assets];
  }

  /* istanbul ignore next: this would be integration tests */
  apply(compiler: WebpackCompilerType) {
    compiler.plugin('compilation', (compilation: WebpackCompilationType) => {
      compilation.plugin(
        'html-webpack-plugin-before-html-generation',
        (htmlPluginData: Object, callback: Callback<any>) => {
          addAllAssetsToCompilation(this.assets, compilation, htmlPluginData, callback);
        }
      );
    });
  }
}
