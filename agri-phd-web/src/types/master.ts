/** Mirrors DropdownItem DTO from AgriPhd.Api */
export interface DropdownItem {
  value: string
  text: string
  group?: string
}

/** Mirrors SaluationMapItem — salutation ↔ gender mapping */
export interface SaluationMapItem {
  saluationId: number
  saluationMapId: number
  genderCode: string
}

/** Mirrors MenuItem — hierarchical nav tree */
export interface MenuItem {
  menuId: number
  parentMenuId: number | null
  menuName: string
  menuUrl: string
  target: string
  isNew: boolean
  seqNo: number
  children: MenuItem[]
}
