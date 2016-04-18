jest.unmock('../src');
jest.unmock('../src/merge');
jest.unmock('lodash/isFunction');

import isFunction from 'lodash/isFunction';
import presets from '../src';
import merge from '../src/merge';


describe('Presets', () => {
  it('should export function', () => {
    expect(isFunction(presets)).toEqual(true);
  });

  it('should return pipe function', () => {
    expect(isFunction(presets())).toEqual(true);
  });
});

describe('Presets pipe', () => {
  it('should accept correct arguments', () => {
    const pipe = presets();
    expect(() => pipe([])).toThrow();
  });

  it('should return merge function', () => {
    const pipe = presets();
    expect(isFunction(pipe())).toEqual(true);
  });
});

describe('Presets merge', () => {
  const pipeInput = {
    input: 'Hello world!'
  };

  const presetInput = {
    foo: 'bar'
  };

  let presetMock1 = null;
  let presetMock2 = null;
  let presetMock3 = null;

  let merger = null;

  beforeEach(() => {
    const pipe = presets({
      ...pipeInput
    });

    presetMock1 = jest.genMockFunction();
    presetMock2 = jest.genMockFunction();

    const presetMock4 = jest.genMockFunction().mockImplementation(props => {
      presetMock3 = jest.genMockFunction();
      return presetMock3.bind(null, props);
    });

    merger = pipe(
      presetMock1,
      presetMock2,
      presetMock4({
        ...presetInput
      })
    );
  });

  it('should execute pipe and pass arguments from presets', () => {
    merger(merge);

    expect(presetMock1).toBeCalledWith({
      ...pipeInput
    });

    expect(presetMock2).toBeCalledWith({
      ...pipeInput
    });

    expect(presetMock3).toBeCalledWith({...presetInput}, {...pipeInput});
  });
});


describe('Merge result', () => {
  it('should be correct according to root level', () => {
    const pipe = presets({
      a: 1,
      b: 2,
      c: 3
    });

    const merger = pipe(
      props => ({
        foo: 1,
        a: props.a
      }),
      props => ({
        foo: 2,
        b: props.b
      }),
      props => ({
        foo: 3,
        c: props.c
      })
    );

    expect(merger(merge)).toEqual({
      a: 1,
      b: 2,
      c: 3,
      foo: 3
    });
  });

  it('should be correct with initial value', () => {
    const pipe = presets({
      a: 1
    });

    const merger = pipe(
      props => ({
        foo: 1,
        a: props.a
      })
    );

    const initialValue = {
      bar: 2
    };

    expect(merger(merge, initialValue)).toEqual({
      a: 1,
      foo: 1,
      bar: 2
    });
  });

  it('should be correct with custom merger', () => {
    const pipe = presets();

    const merger = pipe(
      props => ({
        a: 1
      }),
      props => ({
        b: 1
      }),
      props => ({
        c: 1
      })
    );

    const initialValue = {
      bar: 2
    };

    // use only last preset
    const customMerge = (a, b) => a;

    expect(merger(customMerge, initialValue)).toEqual({
      c: 1
    });
  });
});
