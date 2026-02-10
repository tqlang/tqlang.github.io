# Data and Types

tq is a strictly-typed language. It means that every data or object that
holds data is fully tied to a single data type, that can be explicitly declarated
by the user or infered in case of being ommited.

Like in C, C# or Java, all input, output and storage of data needs to be declared
with a specific type to make sure any binary data will be read or written accordingly. \
Type strictness (AKA static typing) is an important resource in a program language as
it can be used to define complex structures, non-numerical data, lists, references
and alike.

An example on the use of types:
```tq
from Std.Console import

# The function main will ask for a list of strings
# to be called. It also declares a return type
# 'void', meaning it will not return any valid data.
@public func main([]string args) !void {

	# Let's declare 3 variable data spaces in program's
	# memory, one for a signed byte, short and integer.
	let i8 myByte = 8
	let i16 myShort = 16
	let i32 myInt = 32

	# Now, let's pass these variables in a function 'foo'
	# which is an overloaded to accept multiple types as
	# shown below.

	# The first call is receiving an 'i8' as its argument.
	# As the function is declared to accept 'i8', this
	# code will be executed.
	foo(myByte) # foo(i8) -> void

	# The second call is receiving a 'i32' as its argument.
	# The function has an overload that accepts a 'i32'.
	# Hence, this code will be executed.
	foo(myInt) # foo(i32) -> void

	# The third call is receiving an 'i16' as its argument.
	# It can be seen below, that we don't have any overload
	# of 'foo' that accepts a value of the type 'i16'.
	# However, as the type 'i16' is implicitly convertible
	# to the type 'i32', the program will implicitly
	# convert the argument to i32 and call the right
	# overload.
	foo(myShort) # foo(i32) -> void

}

# Overloads of the function 'foo'
@public func foo(i8 value) {
	writeln("The value is a byte and it is \{value}!")
}
@public func foo(i32 value) {
	writeln("The value is an int32 and it is \{value}!")
}

```
```text title="Console Output"
The value is a byte and it is 8!
The value is an int32 and it is 32!
The value is an int32 and it is 16!
```
