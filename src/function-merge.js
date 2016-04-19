export default (highOrder, func) => {
  return func.bind(null, highOrder);
};
