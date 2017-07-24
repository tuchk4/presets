# Presets

[![Greenkeeper badge](https://badges.greenkeeper.io/tuchk4/presets.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.org/tuchk4/presets.svg?branch=master)](https://travis-ci.org/tuchk4/presets)

Presets collection merger. 

## Motivation

There are a lot of npm packages with documentation, a lot of local configurable modules and every time 
I should read / learn documentation to configuration package to meet my requirements. Or search for guidelines and tutorials.
And that configuration code will be copied from project to project.
 
For example - we have a lot of projects with webpack and karma. That configs are almost the same. 
Webpack common sections:
  
  - Plugins for production (optimization)
  - Plugins for development (devtool, define etc.)
  - resolve attr.
  - context attr.
  - resolveLoader fallback

Webpack different sections:

  - entry
  - externals
  - loaders 

Sure we could move common code to separated repository and it always will be up to date for all projects (even possible to 
bind to specific version). But this is not good solution: For karma config - we should do the same. Or we want to
use webpack production configuration from boilerplate repository at github, where community always suggest best ways and
practices.

This also could be applicable to:
 
  - api configuration
  - components configuration
  - cli tasks configuration
  - environment configuration
  - routing configuration
  - middleware configuration (express / redux etc.)
  - generating higher-ordered functions
    
## Сoncepts

**preset** - simple function with return statement. Could be configured with higher-order function. Returned value is depends
on preset's context.

**merger** - function that merge presets. Responsible for the way how presets should be merged: 

  - should preset's results be merged at the root level?
  - should preset's results be merged at all nested levels?
  - should some attributes be merged or overridden?
  - should some attributes be merged or overridden if already exists?
  - if preset's result is function - each next preset should be the higher-order function. What function's arguments 
behaviour should be in this way? 

    
## API

  - **presets(props = {})** - Takes props (optional) that will be passed to each preset's function. Could be used for
configuration. Returns presetsCollection function. 
  - **presetsCollection(...presets)** - Takes presets collection (strings or functions). Returns collectionMerge function.
  - **collectionMerge(merger, initialValue = {})** -  Takes merger function (required, details below) and initial value (optional).
Returns merged result. 

### Presets

```js
import presets from 'presets';
```
**presets(props)** - returns function for configuring presets collection. props - optional argument and if exists -
it will be passed as first arguments for each preset in collection.

### Presets collection

```js
import presets from 'presets';
const pipe = presets({
  // ...
});
```

**pipe(...presets)** - returns function for prepared presets collection merge. Takes presets (strings or functions) as arguments.
Is presets is string - will try to find preset in `node_modules`. Preset's package name - 'preset-${name}'.
In this way - preset's module export - should be a function. Next steps are same as below (if preset is function).

```js
import presets from 'presets';
const presetsCollection = presets({
  // ...
});

const mergeCollection = presetsCollection({
  'webpack-production', // will search for "preset-webpack-production" in node_modules
  'webpack-hot-reload'  // will search for "preset-webpack-hot-reload" in node_modules
});
```

Is preset is function - it will be executed and it's result will be merged with other presets using merge function.
    
```js
import presets from 'presets';
const presetsCollection = presets({
  // ...
});

const mergeCollection = presetsCollection({
  (props) => {
    return {
      // ...
    };
  }
});
```

And combined:

```js
import presets from 'presets';
const presetsCollection = presets({
  // ...
});

const mergeCollection = presetsCollection({
  'webpack-production', // will search for "preset-webpack-production" in node_modules
  'webpack-hot-reload'  // will search for "preset-webpack-hot-reload" in node_modules
   (props) => {
      return {
        // ...
      };
   }
});
```

There is list of existing presets and it's description and the end of documentation.

### Collection merge

```js
import presets from 'presets';
import merge from 'merge';

const presetsCollection = presets({
  // ...
});

const mergeCollection = presetsCollection({
  // ...
});

const initialValue = {
  // ...
};

const config = mergeCollection(merge, initialValue);
```

**merge** - simple function that merge preset's results. 
Example of it's very simple implementation:

```js
const merge = (collectionConfig, presetConfig) => ({
  ...collectionConfig,
  ...presetConfig
});
```

According to merge requirements - could be more complex. 
There is list of merge functions and it's description and the end of documentation.
    
    
## Install

`npm install --save presets`

## Abstract example

```js
import presets from 'presets';
import merge from 'presets/merge';

const presetsCollection = presets({
  // ...
});

// will search for 'presets-foo', 'presets-bar', 'presets-baz' in node_modules
const mergeCollection = presetsCollection('foo', 'bar', 'baz');


const initialConfig = {
  // ....
};

const config = mergeCollection(merge, initialConfig);
```

## Real example

Webpack:
```js
import presets from 'presets';
import webpackMerge from 'webpack-merge';
import webpackIndexTemplates from 'webpack-index-templates';

const presetsCollection = presets();

const mergeCollection = presetsCollection(
  'webpack-production', 
  'webpack-dev',
  'webpack-react-toolbox',
  'webpack-build-logs',
  'webpack-hot-reload',
  webpackIndexTemplates({
    src: './index.html',
    dest: 'index.html',
    variables: {
      // ...
    }
  }),
  
  webpackIndexTemplates({
    src: './index.html',
    dest: 'index-staging.html',
    variables: {
      // ...
    }
  }),
);

const initialWebpackConfig = {
  entry: {
    app: [
      'babel-polyfill',
      './scripts/master'
    ]
  },
};

const webpackConfig = mergeCollection(webpackMerge, initialWebpackConfig);
```

Karma:
```js
import presets from 'presets';
import karmaMerge from 'karma-merge';

const presetsCollection = presets();

const mergeCollection = presetsCollection(
  'karma-webpack',
  'karma-coverage',
  'karma-chrome',
  'karma-mocha',
  'karma-phantomjs',
  'karma-gremlins'
);

const initialKarmaConfig = {
  files: [
    'src/**/*/__tests__/*.js'
  ]
};

const karmaConfig = mergeCollection(karmaMerge, initialKarmaConfig);
```

APi configuration:
```js
import presets from 'presets';
import functionalMerge from 'presets/functional-merge';

const presetsCollection = presets();

const mergeCollection = presetsCollection(
  'fetch',
  'cross-browser',
  'cache-request'
);


const api = mergeCollection(functionalMerge);

api('POST /users/1', {
  // ... request
});
```

React component configuration:
```js
import presets from 'presets';
import merge from 'presets/merge';

import aclPresets form 'acl-presets';

const presetsCollection = presets();

const mergeCollection = presetsCollection(
  props => <Button ...props/>,
  aclPresets({
    admin: () => { //... },
    guest: () => { //... }
  }),
);


const AclButton = mergeCollection(merge);
```

Express configurations
```js
import presets from 'presets';
import merge from 'presets/merge';

const presetsCollection = presets();

const mergeCollection = presetsCollection(
  'express-auth',
  'express-secure-routing',
  'express-spa'
);


const server = mergeCollection(merge);
```

## Contribute

`npm test` - run tests.
`npm run test-dev` - monitors the file system for changes and run tests
`npm run dev` - monitors the file system for changes and transpile ES6 code. Very and very useful when packages is linked (`npm link`)

If you develop presets - make pull request add link to your presets with little description.
 
  
## Troubleshooting

### Configurable string presets 

If use presets as functions - preset could be configured:
```js
import presets from 'presets';

const configurablePreset = (options) => {
  // ...
  return props => {
    // ...
  }
}

const presetsCollection = presets();

const mergeCollection = presetsCollection({
  configurablePreset({
    // ...  presets configuration here
  })
});
```

But if use preset from node_modules (eg. external presets) that should be auto-imported - we should import it manually
and use as function. So this way is not very pretty (auto-import feature is not using).

```js
import presets from 'presets';
import presetWebpackProduction from 'preset-webpack-production';

const presetsCollection = presets({
  // ...
});

const mergeCollection = presetsCollection({
  presetWebpackProduction({
    // ...  presets configuration here
   })
});
```

One of the way to improve this - use something like `.presetsrc` (but there are also some problems: could not be configured
according to current environment or via dynamic options):
```js
{
  "webpack-production": {
     // ...
  }
}
```

Second way: use configuration hook:

```js
import presets from 'presets';

const presetsCollection = presets({
  // ...
});

presetsCollection.hooks.configuration('webpack-production', () => {
  return {
    // ...
  }
});

const mergeCollection = presetsCollection({
  'webpack-production'
});
```

If you have ideas - just let me know. Also there is issue#1 for discussing.

## Presets list

  - preset-webpack-production
  - preset-webpack-development
  - preset-webpack-index-templates
  - preset-karma
  - preset-bivrost-api
  
## Mergers list

  - root-merge
  - deep-merge
  - webpack-merge
  - functional-merge



     
