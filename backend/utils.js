function getCookie(cookies, name) {
  let matches = cookies.match(
    new RegExp(
      "(?:^|; )" +
        name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1") +
        "=([^;]*)"
    )
  );
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

function json(json) {
    return JSON.stringify(json)
}

module.exports = {
  getCookie,
  json,
};
