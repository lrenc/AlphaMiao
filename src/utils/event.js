
let list = {};

export function listen(name, callback) {
  list[name] = callback;
}

export function dispatch(name, ...data) {
  let fn = list[name];
  if (fn) {
    fn.call(null, ...data);
  }
}

export default {
  listen,
  dispatch
};
