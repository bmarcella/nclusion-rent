type Authority = string | { authority: string }

export function hasAuthority(
    authorities: Authority[] = [],
    role: string,
    negate: boolean = false,
): boolean {
    const roles = authorities.map((auth) =>
        typeof auth === 'string' ? auth : auth.authority,
    )
    const hasRole = roles.includes(role)
    return negate ? !hasRole : hasRole
}

export function hasAuthorities(
    authorities: Authority[] = [],
    rolesToCheck: string[],
    negate: boolean = false,
): boolean {
    const roles = authorities.map((auth) =>
        typeof auth === 'string' ? auth : auth.authority,
    )

    const hasAnyRole = rolesToCheck.some((role) => roles.includes(role))

    return negate ? !hasAnyRole : hasAnyRole
}
