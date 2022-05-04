const ShopItems = [
  {
    name: "PP Enlarger (5000). Enlarge your PP by 120%",
    value: "pluspp",
    price: 5000,
  },
  {
    name: "PP Massive Shrinker (12500). Shrink all of other PP by 50%.",
    value: "minuspp",
    price: 12500,
  },
];

function findItem(value) {
  return ShopItems.find((obj) => obj.value === value)
    ? ShopItems.find((obj) => obj.value === value)
    : ShopItems.find((obj) => obj.value === "default");
}

module.exports = {
  ShopItems,
  findItem,
};
