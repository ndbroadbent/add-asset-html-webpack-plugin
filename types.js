// @flow

type TypeOfAssetType = 'js' | 'css';

export type Callback<T> = (err: ?Error, x: ?T) => void;

export type AssetType = {
  filepath: string,
  hash?: boolean,
  includeSourcemap?: boolean,
  outputPath?: string,
  publicPath?: string,
  typeOfAsset?: TypeOfAssetType,
};

export type ArrayOfAssetsType = Array<AssetType>;

type WebpackAssetType = {
  size: () => number,
  source: () => string,
};

type WebpackAssetMapType = { [key: string]: WebpackAssetType };

export type WebpackCompilationType = {
  assets: WebpackAssetMapType,
  errors: Array<Error>,
  plugin: (eventName: string, callback: ?(data: any, callback: Callback<any>) => void) => void,
};

export type WebpackCompilerType = {
  plugin: (eventName: string, callback: (compilation: WebpackCompilationType) => void) => void,
};
