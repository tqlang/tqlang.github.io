---
title: System
---

# Std.System

:::under-construction
:::
:::not-implemented
:::


```pseudo
namespace Std.System
```

`Std.System` implements common interface with low-level, OS and hardware

---

## Namespaces
| Namespace | Description |
|:---------:|:------------|
| [OS](OS/) | Implementetions of interfaces between the host OS APIs |
| x86       | Specific operations for the Intel x86 archtecture |
| x86_64    | Specific operations for the Intel x86_64 archtecture |
| AArch64   | Specific operations for the 64-bit ARM archtecture |
| RISC_V    | Specific operations for the RISC-V archtecture |

---

## Fields
| Field     | Type        | Acess                   | Description |
|:---------:|:-----------:|:-----------------------:|:------------|
| arch      | Archtecture | Read only, compile time | The reference of the archtecture being targeted for the build |
| os        | HostSystem  | Read only, compile time | The reference of the operational system targeted for the build |

---

## Enums

```tq
@public typedef Archtecture {
    case x86
    case x86_64
    case aarch64
    case risc_v
}
```

```tq
@public typedef HostSystem {
    case windows
    case linux

    case uefi
    case bios
}
```
