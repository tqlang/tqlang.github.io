---
title: System
---

# Std.System

:::under-construction
:::
:::not-implemented
:::


```tq
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
| RISC_V    | Specific operations for the RISK-V archtecture |

---

## Fields
| Field     | Type        | Acess                   | Description |
|:---------:|:-----------:|:-----------------------:|:------------|
| arch      | Archtecture | Read only, compile time | The reference of the archtecture being targeted for the build |
| os        | HostSystem  | Read only, compile time | The reference of the operational system targeted for the build |

---

## Enums

```tq
@public enum Archtecture {
    x86,
    x86_64,
    aarch64,
    risc_v
}
```

```tq
@public enum HostSystem {
    windows,
    linux,

    uefi,
    bios
}
```
