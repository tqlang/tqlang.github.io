---
title: Compilation
---

# Std.Compilation

:::under-construction
:::
:::not-implemented
:::

```pseudo
namespace Std.Compilation
```

`Std.Compilation` is a interface between the code and the compiler

---

## Namespaces
| Namespace | Description |
|:---------:|:------------|

---

## Structures
| Structure | Alias | Description |
|:---------:|:-----:|:------------|

---

## Fields
| Field          | Type                                            | Acxess                          | Description |
|:--------------:|:-----------------------------------------------:|:-------------------------------:|:------------|
| targetArch     |[Std.System.Archtecture](../System/#archtecture) | Public, read only, compile time | The reference of the archtecture being targeted for the build |
| targetSystem   |[Std.System.HostSystem](../System/#archtecture)  | Public, read only, compile time | The reference of the operating system being targeted for the build |
| currentLine    | uint                                            | Public, read only, compile time | The current line in the source file |
| currentSource  | string                                          | Public, Read only, compile time | The path to the current script's source file |
| functionName   | string                                          | Public, Read only, compile time | The name of the caller function |

