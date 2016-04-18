import magicRequire from 'magic-require';
import isString from 'lodash/isString';
import isFunction from 'lodash/isFunction';

export default 10;

export default (props) => {
  return function(...presets) {
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

    return function(merge, initConfig = {}) {
      return normalized.reduce((config, preset) => {
        return merge(preset(props), config);
      }, initConfig);
    }
  }
}
