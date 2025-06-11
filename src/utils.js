window.PFCUtils = {
  slugify(str) {
    return str.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
  }
};
