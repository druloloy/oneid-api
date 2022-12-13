module.exports = function (str) {
    if (!str) return '';
    return str
        .split(' ')
        .map((word) => word[0].toUpperCase() + word.slice(1))
        .join(' ');
};
