let Search = function () {
  let listeners = [];
  let selectedItem;

  let onSearchChange = (fn) => {
    listeners.push(fn);
  };

  let updateSearch = (item) => {
    selectedItem = item;
    listeners.forEach(listener => listener(selectedItem));
  };

  let getSearch = () => {
    return selectedItem;
  };

  return { onSearchChange, updateSearch, getSearch };
};

export default Search;
