export const getTTL = (pathname: string) => {
  if (pathname.includes("/products")) return 60; 
  if (pathname.includes("/user")) return 30; 
  return 10; 
};