// tests whether a field's value was not entered by the user
export const isNotEmpty = val => val || val === 0

// tests whether a number is positive (0 included) and not a decimal number
export const isPositiveInteger = val => {
  const parsedInt = parseInt(val)
  return !isNaN(parsedInt) && val == parsedInt && +val >= 0
}

// tests whether a number is a positive (0 included) real number (decimals allowed)
export const isPositiveNumber = val => {
  const parsedFloat = parseFloat(val)
  return !isNaN(parsedFloat) && +parsedFloat >= 0
}
