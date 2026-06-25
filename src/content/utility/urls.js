const URL_REGEX = /https?:\/\/\S+/gi;

// function maskUrls(text) {
//   return text.replace(URL_REGEX, match => `__URL_${match}__`);
// }

// function unmaskUrls(text) {
//   return text.replace(/__URL_(.*?)__/g, (m, original) => original);
// }
let URL_STORE = [];

function maskUrls(text) {
  return text.replace(URL_REGEX, match => {
    const id = URL_STORE.length;
    URL_STORE.push(match);
    return `@@URL_${id}@@`;
  });
}

function unmaskUrls(text) {
  return text.replace(/@@URL_(\d+)@@/g, (_, id) => URL_STORE[id]);
}

export {
  URL_REGEX,
  maskUrls,
  unmaskUrls,
}