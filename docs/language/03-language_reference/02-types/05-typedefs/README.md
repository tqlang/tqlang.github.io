# Typedefs

:::under-construction
:::

Type definitions, or typedefs, are a powerfull way to declarate primitive-like types
with custom rules and behavior.

---
## Declarting Typedefs

To declarate a typedef, you can do:
```tq
typedef MyCustomType {
	# Here you can define value
	# entries and functions
}
```

To declarate the typedef with a specific undercovered type, use the following:

```tq
typedef(MyType) MyCustomType {
	# Here you can define value
	# entries and functions
}
```

Using an undercovered type automatically allows you to explicitly cast to
that type.

Any type that is not an integer will ask for a compile-time defined value for
each value entry.

---
## Defining Entries

There are two kinds of entries that can fit in a typedef: numericals and named entries.
Is important to notice that both entries kinds can be used for any type, although they
must be defined slightly diferent when using integer types or not.
All typedef entries must beguin with the `case` keyword:

```tq
typedef MyCustomType {
    case 1, 2, 3, 4, 5
    case 10, 15, 20, 25, 30
}
```

Numeric entries can also be defined using the range notation:

```tq
typedef MyCustomType {
	case 1..5
	case 10..30:5
}
```

To define named entries, just write it name following the identifiers convention:

```tq
typedef MyCustomType {
	case 1..5
	case 10..30:5

	case NamedValue1
	case NamedValue2
	case NamedValue3
}
```

## Using Typedefs

After define entries inside the typedef, you will be ble to use them as literal values.

When using numeric values, you can just use a number literal included in the typedef:
```tq
let MyCustomType = 5
```
Using a number that is not included in the typedef will result in a compilation error.

When using literal values, you need to first referenceate the typedef or use the dot
notation to automatically identify the typedef type, if possible:
```tq
let myvar1 = MyCustomType.NamedValue1
let MyCustomType myvar2 = .NamedValue2
```

Take this typedef implementation as a example:

```tq
typedef Food {
	case hamburger
	case vegan_burger
	case x_burger
	case salad
	case orange_juice
	case chocolate_milk
	case cola
}

# This function receives a  string and
# Normalize the data into `Food`.
# Returns an error if the input is not
# recognized.
func doOrder(string order) !void {

	let foodValue = match (order.trim()) {
		case "hamburger"        => .hamburger
		case "vegan burger"     => .vegan_burger
		case "x burger"         => .x_burger
		case "salad"            =>  .salad
		case "orange juice"     => .orange_juice
		case "chocolate milk",
		     "choco milk"       => .chocolate_milk
		case "cola"             => .cola

		default => throw falt.UnrecognizedInput()
	}

}
```
