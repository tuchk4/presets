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

  it('should return presetsCollection function', () => {
    expect(isFunction(presets())).toEqual(true);
  });
});


describe('presetsCollection', () => {
  it('should return mergeCollection function', () => {
    const presetsCollection = presets();
    expect(isFunction(presetsCollection())).toEqual(true);
  });

  it('should accept correct arguments', () => {
    const presetsCollection = presets();
    expect(() => presetsCollection([])).toThrow();
  });
});

describe('mergeCollection', () => {
  const props = {
    input: 'Hello world!'
  };

  const presetInput = {
    foo: 'bar'
  };

  let presetMock1 = null;
  let presetMock2 = null;
  let presetMock3 = null;

  let mergeCollection  = null;

  beforeEach(() => {
    const presetsCollection = presets({
      ...props
    });

    presetMock1 = jest.genMockFunction();
    presetMock2 = jest.genMockFunction();

    const presetMock4 = jest.genMockFunction().mockImplementation(props => {
      presetMock3 = jest.genMockFunction();
      return presetMock3.bind(null, props);
    });

    mergeCollection = presetsCollection(
      presetMock1,
      presetMock2,
      presetMock4({
        ...presetInput
      })
    );
  });

  it('should execute pipe and pass arguments from presets', () => {
    mergeCollection(merge);

    expect(presetMock1).toBeCalledWith({
      ...props
    });

    expect(presetMock2).toBeCalledWith({
      ...props
    });

    expect(presetMock3).toBeCalledWith({...presetInput}, {...props});
  });
});


describe('Merge result', () => {
  it('should be correct according to root level', () => {
    const presetsCollection = presets({
      a: 1,
      b: 2,
      c: 3
    });

    const mergeCollection = presetsCollection(
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

    expect(mergeCollection(merge)).toEqual({
      a: 1,
      b: 2,
      c: 3,
      foo: 3
    });
  });

  it('should be correct with initial value', () => {
    const presetsCollection = presets({
      a: 1
    });

    const mergeCollection = presetsCollection(
      props => ({
        foo: 1,
        a: props.a
      })
    );

    const initialValue = {
      bar: 2
    };

    expect(mergeCollection(merge, initialValue)).toEqual({
      a: 1,
      foo: 1,
      bar: 2
    });
  });

  it('should be correct with custom merger', () => {
    const presetsCollection = presets();

    const mergeCollection = presetsCollection(
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

    expect(mergeCollection(customMerge, initialValue)).toEqual({
      c: 1
    });
  });
});
