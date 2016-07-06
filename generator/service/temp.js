let <%= upCaseName %> = function () {
  let value;

  let setValue = (val) => value = val;

  let getValue = () => value;

  return { setValue, getValue };
};

export default <%= upCaseName %>;
