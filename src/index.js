import magicRequire from 'magic-require';
import isString from 'lodash/isString';
import isFunction from 'lodash/isFunction';

export default function presets(props) {
  return function presetsCollection(...presets) {
    const normalized = presets.map(preset => {
      if (isString(preset)) {
        const presetModule = `preset-${preset}`;
        return magicRequire(presetModule);
      } else if (isFunction(preset)) {
        return preset;
      } else {
        throw new Error('Wrong preset type. Should be string or function');
      }
    });

    return function mergeCollection(merge, initConfig = {}) {
      return normalized.reduce((config, preset) => {
        return merge(preset(props), config);
      }, initConfig);
    }
  }
}
