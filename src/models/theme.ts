import { Scheme, argbFromHex } from '@material/material-color-utilities';

const source = argbFromHex(
  '#3D5AFE' 
);

const lightSchemeForCss = Scheme.light(
  source 
);

const darkSchemeForCss = Scheme.dark(
  source 
);
console.log(
  lightSchemeForCss.primary 
);
