// shared/formAtoms.tsx
// Primitive building blocks consumed by every document Form.
// Override any atom by shadowing the import in the concrete document folder.

import React, { useId, useState, useEffect, useCallback } from 'react'
import {
    CaretDown, Warning, Info, CheckCircle, X,
    Calendar, ArrowRight, Copy, Eye, EyeSlash,
    Star
} from '@phosphor-icons/react'
import { motion } from 'framer-motion'

// ─── Section ──────────────────────────────────────────────────────────────────

export interface FormSectionProps {
    icon?: React.ReactNode
    title: string
    index?: string | number
    /** extra content floated to the right of the title row */
    aside?: React.ReactNode
    children: React.ReactNode
    className?: string
    collapsible?: boolean
    defaultCollapsed?: boolean
    status?: 'valid' | 'error' | 'warning' | 'info' | 'required'
    statusMessage?: string
    accentColor?: string
    badge?: React.ReactNode
}

export function FormSection({
    icon,
    title,
    index,
    aside,
    children,
    className = '',
    collapsible = false,
    defaultCollapsed = false,
    status,
    statusMessage,
    badge
}: FormSectionProps) {
    const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)
    const [isHovered, setIsHovered] = useState(false)

    const statusStyles = {
        valid: { dot: 'bg-green-500', border: 'hover:border-green-500/30', text: 'text-green-500' },
        error: { dot: 'bg-error', border: 'hover:border-error/30', text: 'text-error' },
        warning: { dot: 'bg-yellow-500', border: 'hover:border-yellow-500/30', text: 'text-yellow-500' },
        info: { dot: 'bg-brand', border: 'hover:border-brand/30', text: 'text-brand' },
        required: { dot: 'bg-purple-500', border: 'hover:border-purple-500/30', text: 'text-purple-400' }
    }

    return (
        <div
            className={`
                relative rounded-2xl bg-bg-primary/80 backdrop-blur-sm
                border border-border-subtle transition-all duration-500
                ${collapsible ? 'hover:border-border-med' : ''}
                ${status ? statusStyles[status]?.border : ''}
                ${isHovered ? 'shadow-lg scale-[1.01]' : 'shadow-sm'}
                ${className}
            `}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Status indicator line */}
            {status && (
                <div className={`
                    absolute top-3 left-0 w-1 h-6 rounded-r-full
                    ${statusStyles[status]?.dot}
                    transition-all duration-500
                    ${isHovered ? 'h-8 top-2' : ''}
                `} />
            )}

            {/* Header */}
            <div
                className={`
                    flex items-center justify-between px-5 py-4
                    ${collapsible ? 'cursor-pointer select-none' : ''}
                `}
                onClick={() => collapsible && setIsCollapsed(!isCollapsed)}
            >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Icon with hover effect */}
                    <div className={`
                        relative flex items-center justify-center w-8 h-8 rounded-xl
                        transition-all duration-500
                        ${isHovered ? 'bg-brand/20 scale-110' : 'bg-brand/10'}
                        ${status ? statusStyles[status]?.text : 'text-brand'}
                    `}>
                        {icon && React.cloneElement(icon as React.ReactElement, {
                            weight: isHovered ? 'fill' : 'regular',
                            className: `transition-all duration-500 ${isHovered ? 'scale-110' : ''}`
                        })}

                        {/* Status dot */}
                        {status && (
                            <span className={`
                                absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full
                                ${statusStyles[status]?.dot}
                                animate-pulse
                            `} />
                        )}
                    </div>

                    {/* Title */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className={`
                                text-base font-semibold tracking-tight
                                transition-all duration-500
                                ${isHovered ? 'text-ink-high' : 'text-ink-med'}
                                ${status ? statusStyles[status]?.text : ''}
                            `}>
                                {title}
                            </h3>
                            {badge}
                        </div>

                        {/* Subtle status message */}
                        {statusMessage && (
                            <motion.p
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`
                                    text-[10px] mt-0.5
                                    ${status ? statusStyles[status]?.text : 'text-ink-lower'}
                                `}
                            >
                                {statusMessage}
                            </motion.p>
                        )}
                    </div>

                    {/* Collapse button */}
                    {collapsible && (
                        <motion.div
                            animate={{ rotate: isCollapsed ? -90 : 0 }}
                            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                            className={`
                                flex items-center justify-center w-7 h-7 rounded-lg
                                transition-all duration-500
                                ${isHovered ? 'bg-black/10' : ''}
                            `}
                        >
                            <CaretDown size={14} weight="bold" className="text-ink-lower" />
                        </motion.div>
                    )}
                </div>

                {/* Aside */}
                {aside && (
                    <div className="ml-4 text-ink-lower group-hover:text-ink-med transition-colors duration-500">
                        {aside}
                    </div>
                )}
            </div>

            {/* Content with smooth animation */}
            <motion.div
                initial={false}
                animate={{
                    height: isCollapsed ? 0 : 'auto',
                    opacity: isCollapsed ? 0 : 1,
                    marginTop: isCollapsed ? 0 : 0,
                    marginBottom: isCollapsed ? 0 : 16
                }}
                transition={{
                    duration: 0.3,
                    ease: [0.4, 0, 0.2, 1],
                    height: { duration: 0.3 }
                }}
                className="overflow-hidden will-change-[height,opacity]"
            >
                <div className="px-5">
                    {/* Subtle separator */}
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-border-subtle to-transparent mb-4" />

                    {/* Content with fade-in */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.3 }}
                    >
                        {children}
                    </motion.div>
                </div>
            </motion.div>
        </div>
    )
}


// ─── Radio Group with enhanced UX ─────────────────────────────────────────────

export interface RadioOption {
    value: string
    label: string
    description?: string
    disabled?: boolean
    badge?: string
    icon?: React.ReactNode
}

export interface RadioGroupProps {
    name?: string
    options: RadioOption[]
    value: string | null
    onChange: (value: string) => void
    label?: React.ReactNode
    error?: string
    warning?: string
    success?: string
    hint?: string
    required?: boolean
    optional?: boolean
    disabled?: boolean
    layout?: 'vertical' | 'horizontal' | 'grid'
    gridCols?: 2 | 3 | 4
    size?: 'sm' | 'md' | 'lg'
    variant?: 'default' | 'card' | 'highlight'
    className?: string
}

export function RadioGroup({
    name,
    options,
    value,
    onChange,
    label,
    error,
    warning,
    success,
    hint,
    required,
    optional,
    disabled = false,
    layout = 'vertical',
    gridCols = 2,
    size = 'md',
    variant = 'default',
    className = ''
}: RadioGroupProps) {
    const id = useId()
    const groupName = name || `radio-group-${id}`
    const [hoveredValue, setHoveredValue] = useState<string | null>(null)

    const sizeClasses = {
        sm: {
            radio: 'w-3.5 h-3.5',
            inner: 'w-1.5 h-1.5',
            label: 'text-xs',
            description: 'text-[10px]',
            padding: 'py-1.5',
            gap: 'gap-2'
        },
        md: {
            radio: 'w-4 h-4',
            inner: 'w-2 h-2',
            label: 'text-sm',
            description: 'text-xs',
            padding: 'py-2',
            gap: 'gap-2.5'
        },
        lg: {
            radio: 'w-5 h-5',
            inner: 'w-2.5 h-2.5',
            label: 'text-base',
            description: 'text-xs',
            padding: 'py-2.5',
            gap: 'gap-3'
        }
    }

    const getStatusColor = (isSelected: boolean, isHovered: boolean) => {
        if (disabled) return 'border-border-subtle bg-bg-tertiary/20'
        if (error) {
            return isSelected
                ? 'border-error bg-error/10'
                : isHovered
                    ? 'border-error/70 bg-error/5'
                    : 'border-error/50 hover:border-error/70 hover:bg-error/5'
        }
        if (warning) {
            return isSelected
                ? 'border-yellow-500 bg-yellow-500/10'
                : isHovered
                    ? 'border-yellow-500/70 bg-yellow-500/5'
                    : 'border-yellow-500/50 hover:border-yellow-500/70 hover:bg-yellow-500/5'
        }
        if (success) {
            return isSelected
                ? 'border-green-500 bg-green-500/10'
                : isHovered
                    ? 'border-green-500/70 bg-green-500/5'
                    : 'border-green-500/50 hover:border-green-500/70 hover:bg-green-500/5'
        }
        return isSelected
            ? 'border-brand bg-brand/10'
            : isHovered
                ? 'border-brand/70 bg-brand/5'
                : 'border-border-subtle hover:border-brand/50 hover:bg-brand/5'
    }

    const layoutClasses = {
        vertical: 'flex flex-col gap-2',
        horizontal: 'flex flex-row flex-wrap gap-4',
        grid: `grid grid-cols-1 sm:grid-cols-${gridCols} gap-2`
    }

    const variantClasses = {
        default: '',
        card: 'p-3 rounded-lg border',
        highlight: 'p-3 rounded-xl border-2 shadow-sm'
    }

    const statusIcon = error ? 'error' : warning ? 'warning' : success ? 'success' : null
    const statusText = error || warning || success

    return (
        <div className={`space-y-2 ${className}`}>
            {/* Label */}
            {(label || required || optional) && (
                <div className="flex items-center gap-1.5 px-1">
                    <span className={`text-xs font-medium ${error ? 'text-error' : 'text-ink-med'}`}>
                        {label}
                    </span>
                    {required && <span className="text-error/80 text-xs">*</span>}
                    {optional && (
                        <span className="text-ink-lower text-[9px] uppercase tracking-wider">
                            (opcjonalne)
                        </span>
                    )}
                </div>
            )}

            {/* Radio Group */}
            <div role="radiogroup" className={layoutClasses[layout]}>
                {options.map((option) => {
                    const isSelected = value === option.value
                    const isHovered = hoveredValue === option.value
                    const isDisabled = disabled || option.disabled

                    if (variant === 'card' || variant === 'highlight') {
                        return (
                            <motion.label
                                key={option.value}
                                whileHover={!isDisabled ? { scale: 1.01, y: -1 } : {}}
                                whileTap={!isDisabled ? { scale: 0.99 } : {}}
                                className={`
                  relative block cursor-pointer transition-all duration-200
                  ${variantClasses[variant]}
                  ${getStatusColor(isSelected, isHovered)}
                  ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                  ${isSelected ? 'shadow-sm' : ''}
                `}
                                onMouseEnter={() => !isDisabled && setHoveredValue(option.value)}
                                onMouseLeave={() => setHoveredValue(null)}
                            >
                                <input
                                    type="radio"
                                    name={groupName}
                                    value={option.value}
                                    checked={isSelected}
                                    onChange={() => !isDisabled && onChange(option.value)}
                                    disabled={isDisabled}
                                    className="sr-only"
                                />

                                <div className="flex items-start gap-3">
                                    {/* Custom radio indicator */}
                                    <div className="relative shrink-0 mt-0.5">
                                        <div className={`
                      ${sizeClasses[size].radio} rounded-full border-2
                      transition-all duration-200 flex items-center justify-center
                      ${isSelected
                                                ? error
                                                    ? 'border-error'
                                                    : warning
                                                        ? 'border-yellow-500'
                                                        : success
                                                            ? 'border-green-500'
                                                            : 'border-brand'
                                                : isHovered && !isDisabled
                                                    ? error
                                                        ? 'border-error/70'
                                                        : warning
                                                            ? 'border-yellow-500/70'
                                                            : success
                                                                ? 'border-green-500/70'
                                                                : 'border-brand/70'
                                                    : 'border-border-med'
                                            }
                      ${isDisabled ? 'bg-bg-tertiary' : ''}
                    `}>
                                            {isSelected && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                                                    className={`
                            ${sizeClasses[size].inner} rounded-full
                            ${error
                                                            ? 'bg-error'
                                                            : warning
                                                                ? 'bg-yellow-500'
                                                                : success
                                                                    ? 'bg-green-500'
                                                                    : 'bg-brand'
                                                        }
                          `}
                                                />
                                            )}
                                        </div>

                                        {/* Selected ring animation */}
                                        {isSelected && !isDisabled && (
                                            <motion.div
                                                initial={{ scale: 0.8, opacity: 0.5 }}
                                                animate={{ scale: 1.4, opacity: 0 }}
                                                transition={{ duration: 0.4, repeat: Infinity, repeatDelay: 1 }}
                                                className={`
                          absolute inset-0 rounded-full
                          ${error
                                                        ? 'bg-error/30'
                                                        : warning
                                                            ? 'bg-yellow-500/30'
                                                            : success
                                                                ? 'bg-green-500/30'
                                                                : 'bg-brand/30'
                                                    }
                        `}
                                            />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className={`
                        font-medium leading-tight
                        ${sizeClasses[size].label}
                        ${isDisabled ? 'text-ink-lower' : 'text-ink-high'}
                        ${error && isSelected ? 'text-error' : ''}
                        ${warning && isSelected ? 'text-yellow-600' : ''}
                        ${success && isSelected ? 'text-green-600' : ''}
                      `}>
                                                {option.label}
                                            </span>
                                            {option.badge && (
                                                <span className="text-[8px] px-1.5 py-0.5 rounded-full
                          bg-brand/20 text-brand border border-brand/30">
                                                    {option.badge}
                                                </span>
                                            )}
                                        </div>
                                        {option.description && (
                                            <p className={`
                        ${sizeClasses[size].description} 
                        ${isDisabled ? 'text-ink-lower' : 'text-ink-low'}
                        mt-0.5
                      `}>
                                                {option.description}
                                            </p>
                                        )}
                                    </div>

                                    {/* Icon if provided */}
                                    {option.icon && (
                                        <div className={`
                      shrink-0 transition-all duration-200
                      ${isSelected ? 'text-brand scale-110' : 'text-ink-low'}
                      ${isHovered && !isSelected ? 'scale-105' : ''}
                    `}>
                                            {option.icon}
                                        </div>
                                    )}
                                </div>
                            </motion.label>
                        )
                    }

                    // Default layout (inline)
                    return (
                        <label
                            key={option.value}
                            className={`
                flex items-center ${sizeClasses[size].gap} cursor-pointer
                ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                ${layout === 'horizontal' ? '' : 'w-full'}
              `}
                            onMouseEnter={() => !isDisabled && setHoveredValue(option.value)}
                            onMouseLeave={() => setHoveredValue(null)}
                        >
                            <div className="relative">
                                <input
                                    type="radio"
                                    name={groupName}
                                    value={option.value}
                                    checked={isSelected}
                                    onChange={() => !isDisabled && onChange(option.value)}
                                    disabled={isDisabled}
                                    className={`
                    ${sizeClasses[size].radio} rounded-full border-2
                    transition-all duration-200 appearance-none
                    ${getStatusColor(isSelected, isHovered)}
                    ${isDisabled ? 'bg-bg-tertiary' : 'cursor-pointer'}
                    focus:ring-2 focus:ring-offset-1
                    ${error
                                            ? 'focus:ring-error/30'
                                            : warning
                                                ? 'focus:ring-yellow-500/30'
                                                : success
                                                    ? 'focus:ring-green-500/30'
                                                    : 'focus:ring-brand/30'
                                        }
                  `}
                                />
                                {isSelected && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className={`
                      absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                      ${sizeClasses[size].inner} rounded-full
                      ${error
                                                ? 'bg-error'
                                                : warning
                                                    ? 'bg-yellow-500'
                                                    : success
                                                        ? 'bg-green-500'
                                                        : 'bg-brand'
                                            }
                    `}
                                    />
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <span className={`
                  ${sizeClasses[size].label}
                  ${isDisabled ? 'text-ink-lower' : 'text-ink-high'}
                `}>
                                    {option.label}
                                </span>
                                {option.description && (
                                    <span className={`
                    block ${sizeClasses[size].description} text-ink-low
                  `}>
                                        {option.description}
                                    </span>
                                )}
                            </div>

                            {option.badge && (
                                <span className="text-[8px] px-1.5 py-0.5 rounded-full
                  bg-brand/20 text-brand border border-brand/30 ml-2">
                                    {option.badge}
                                </span>
                            )}
                        </label>
                    )
                })}
            </div>

            {/* Status messages */}
            {(hint || statusText) && (
                <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="px-1"
                >
                    {statusText ? (
                        <p className={`
              text-[10px] flex items-center gap-1
              ${error ? 'text-error' : warning ? 'text-yellow-600' : 'text-green-600'}
            `}>
                            {error && <Warning size={10} weight="fill" />}
                            {warning && <Warning size={10} className="text-yellow-500" />}
                            {success && <CheckCircle size={10} weight="fill" />}
                            {statusText}
                        </p>
                    ) : hint && (
                        <p className="text-[10px] text-ink-lower flex items-center gap-1">
                            <Info size={10} /> {hint}
                        </p>
                    )}
                </motion.div>
            )}
        </div>
    )
}

// ─── Field wrapper ─────────────────────────────────────────────────────────────

export interface FormFieldProps {
    label: React.ReactNode
    error?: string
    warning?: string
    hint?: string
    success?: string
    required?: boolean
    optional?: boolean
    children: React.ReactNode
    className?: string
    layout?: 'vertical' | 'horizontal'
    labelWidth?: string
}

export function FormField({
    label,
    error,
    warning,
    hint,
    success,
    required,
    optional,
    children,
    className = '',
    layout = 'vertical',
    labelWidth = 'w-32'
}: FormFieldProps) {
    const id = useId()

    const getStatusIcon = () => {
        if (error) return <Warning size={12} className="text-error" weight="fill" />
        if (warning) return <Warning size={12} className="text-yellow-500" />
        if (success) return <CheckCircle size={12} className="text-green-500" weight="fill" />
        return null
    }

    const getStatusClass = () => {
        if (error) return 'border-error/50 focus:border-error'
        if (warning) return 'border-yellow-500/50 focus:border-yellow-500'
        if (success) return 'border-green-500/50 focus:border-green-500'
        return ''
    }

    const labelContent = (
        <div className="flex items-center gap-1.5">
            <span className={`text-xs font-medium ${error ? 'text-error' : 'text-ink-med'}`}>
                {label}
            </span>
            {required && <span className="text-error/80 text-xs">*</span>}
            {optional && <span className="text-ink-lower text-[9px] uppercase tracking-wider">(opcjonalne)</span>}
        </div>
    )

    if (layout === 'horizontal') {
        return (
            <div className={`flex items-start gap-3 ${className}`}>
                <div className={`${labelWidth} shrink-0 pt-2`}>
                    {labelContent}
                </div>
                <div className="flex-1">
                    {React.isValidElement(children)
                        ? React.cloneElement(children as React.ReactElement<{ id?: string; className?: string }>, {
                            id,
                            className: `${children.props.className || ''} ${getStatusClass()}`
                        })
                        : children
                    }
                    {hint && !error && !warning && !success && (
                        <p className="text-[10px] text-ink-lower mt-1 flex items-center gap-1">
                            <Info size={10} /> {hint}
                        </p>
                    )}
                    {(error || warning || success) && (
                        <p className={`text-[10px] mt-1 flex items-center gap-1
                            ${error ? 'text-error' : warning ? 'text-yellow-600' : 'text-green-600'}`}>
                            {getStatusIcon()}
                            {error || warning || success}
                        </p>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className={`space-y-1 ${className}`}>
            <label htmlFor={id} className="form-label flex items-center gap-1">
                {labelContent}
            </label>
            {React.isValidElement(children)
                ? React.cloneElement(children as React.ReactElement<{ id?: string; className?: string }>, {
                    id,
                    className: `${children.props.className || ''} ${getStatusClass()}`
                })
                : children
            }
            {hint && !error && !warning && !success && (
                <p className="text-[10px] text-ink-lower flex items-center gap-1">
                    <Info size={10} /> {hint}
                </p>
            )}
            {(error || warning || success) && (
                <p className={`text-[10px] flex items-center gap-1
                    ${error ? 'text-error' : warning ? 'text-yellow-600' : 'text-green-600'}`}>
                    {getStatusIcon()}
                    {error || warning || success}
                </p>
            )}
        </div>
    )
}

// ─── Inputs ────────────────────────────────────────────────────────────────────

export interface TextInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
    error?: boolean
    warning?: boolean
    success?: boolean
    adornmentStart?: React.ReactNode
    adornmentEnd?: React.ReactNode
    size?: 'sm' | 'md' | 'lg'
    fullWidth?: boolean
    mask?: (value: string) => string
    validate?: (value: string) => string | undefined
}

export function TextInput({
    error,
    warning,
    success,
    adornmentStart,
    adornmentEnd,
    size = 'md',
    fullWidth = true,
    mask,
    validate,
    onChange,
    onBlur,
    className = '',
    ...rest
}: TextInputProps) {
    const [internalError, setInternalError] = useState<string>()

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value

        // Apply mask if provided
        if (mask) {
            value = mask(value)
            e.target.value = value
        }

        // Real-time validation if provided
        if (validate) {
            const validationError = validate(value)
            setInternalError(validationError)
        }

        onChange?.(e)
    }, [mask, validate, onChange])

    const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
        if (validate) {
            const validationError = validate(e.target.value)
            setInternalError(validationError)
        }
        onBlur?.(e)
    }, [validate, onBlur])

    const sizeClasses = {
        sm: 'py-1.5 text-xs',
        md: 'py-2 text-sm',
        lg: 'py-2.5 text-base'
    }

    const statusClass = error || internalError
        ? 'border-error/50 focus:border-error focus:ring-error/20'
        : warning
            ? 'border-yellow-500/50 focus:border-yellow-500 focus:ring-yellow-500/20'
            : success
                ? 'border-green-500/50 focus:border-green-500 focus:ring-green-500/20'
                : ''

    if (adornmentStart || adornmentEnd) {
        return (
            <div className={`relative ${fullWidth ? 'w-full' : ''}`}>
                {adornmentStart && (
                    <div className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none text-ink-low">
                        {adornmentStart}
                    </div>
                )}
                <input
                    className={`form-input 
                        ${adornmentStart ? 'pl-8' : ''} 
                        ${adornmentEnd ? 'pr-10' : ''}
                        ${sizeClasses[size]}
                        ${statusClass}
                        ${className}`}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    {...rest}
                />
                {adornmentEnd && (
                    <div className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none text-ink-low">
                        {adornmentEnd}
                    </div>
                )}
            </div>
        )
    }

    return (
        <input
            className={`form-input ${sizeClasses[size]} ${statusClass} ${fullWidth ? 'w-full' : ''} ${className}`}
            onChange={handleChange}
            onBlur={handleBlur}
            {...rest}
        />
    )
}

// ─── TextArea with enhancements ────────────────────────────────────────────────

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    error?: boolean
    warning?: boolean
    success?: boolean
    resize?: 'none' | 'vertical' | 'horizontal' | 'both'
    showCount?: boolean
    maxLength?: number
    minRows?: number
    maxRows?: number
}

export function TextArea({
    className = '',
    error,
    warning,
    success,
    resize = 'vertical',
    showCount = false,
    maxLength,
    minRows = 3,
    maxRows,
    value,
    onChange,
    ...rest
}: TextAreaProps) {
    const [rows, setRows] = useState(minRows)
    const [currentValue, setCurrentValue] = useState(value || '')

    useEffect(() => {
        if (maxRows) {
            const lineBreaks = (currentValue as string).split('\n').length
            setRows(Math.min(Math.max(lineBreaks, minRows), maxRows))
        }
    }, [currentValue, minRows, maxRows])

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setCurrentValue(e.target.value)
        onChange?.(e)
    }

    const resizeClass = {
        none: 'resize-none',
        vertical: 'resize-y',
        horizontal: 'resize-x',
        both: 'resize'
    }[resize]

    const statusClass = error
        ? 'border-error/50 focus:border-error'
        : warning
            ? 'border-yellow-500/50 focus:border-yellow-500'
            : success
                ? 'border-green-500/50 focus:border-green-500'
                : ''

    return (
        <div className="relative w-full">
            <textarea
                className={`form-input ${resizeClass} ${statusClass} ${className}`}
                rows={rows}
                value={value}
                onChange={handleChange}
                maxLength={maxLength}
                {...rest}
            />
            {showCount && maxLength && (
                <div className="absolute bottom-1.5 right-2.5 text-[9px] text-ink-lower bg-bg-primary/80 px-1.5 py-0.5 rounded-full">
                    {(currentValue as string)?.length || 0}/{maxLength}
                </div>
            )}
        </div>
    )
}

// ─── Select with enhancements ─────────────────────────────────────────────────

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    options: { value: string; label: string; disabled?: boolean }[]
    placeholder?: string
    error?: boolean
    warning?: boolean
    success?: boolean
    groups?: { label: string; options: { value: string; label: string }[] }[]
}

export function Select({
    options,
    placeholder,
    error,
    warning,
    success,
    groups,
    className = '',
    ...rest
}: SelectProps) {
    const statusClass = error
        ? 'border-error/50 focus:border-error'
        : warning
            ? 'border-yellow-500/50 focus:border-yellow-500'
            : success
                ? 'border-green-500/50 focus:border-green-500'
                : ''

    return (
        <div className="relative">
            <select
                className={`form-input appearance-none pr-7 ${statusClass} ${className}`}
                {...rest}
            >
                {placeholder && <option value="">{placeholder}</option>}
                {groups ? (
                    groups.map(group => (
                        <optgroup key={group.label} label={group.label}>
                            {group.options.map(o => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </optgroup>
                    ))
                ) : (
                    options.map(o => (
                        <option key={o.value} value={o.value} disabled={o.disabled}>
                            {o.label}
                        </option>
                    ))
                )}
            </select>
            <CaretDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-low pointer-events-none" />
        </div>
    )
}

// ─── InputRow — enhanced shorthand ─────────────────────────────────────────

interface InputRowProps extends Omit<TextInputProps, 'error'> {
    label: React.ReactNode
    error?: string
    warning?: string
    hint?: string
    success?: string
    required?: boolean
    optional?: boolean
    fieldClassName?: string
    layout?: 'vertical' | 'horizontal'
    labelWidth?: string
}

export function InputRow({
    label,
    error,
    warning,
    hint,
    success,
    required,
    optional,
    fieldClassName,
    layout,
    labelWidth,
    ...inputProps
}: InputRowProps) {
    return (
        <FormField
            label={label}
            error={error}
            warning={warning}
            hint={hint}
            success={success}
            required={required}
            optional={optional}
            className={fieldClassName}
            layout={layout}
            labelWidth={labelWidth}
        >
            <TextInput
                error={!!error}
                warning={!!warning}
                success={!!success}
                {...inputProps}
            />
        </FormField>
    )
}

// ─── Toggle with enhanced UX ─────────────────────────────────────────────────

export interface ToggleFieldProps {
    label: string
    description?: string
    checked: boolean
    onChange: (v: boolean) => void
    children?: React.ReactNode
    disabled?: boolean
    size?: 'sm' | 'md' | 'lg'
    hint?: string
    error?: string
}

export function ToggleField({
    label,
    description,
    checked,
    onChange,
    children,
    disabled = false,
    size = 'md',
    hint,
    error
}: ToggleFieldProps) {
    const sizeClasses = {
        sm: { track: 'w-7 h-4', thumb: 'w-3 h-3', thumbActive: 'left-[14px]', thumbInactive: 'left-0.5' },
        md: { track: 'w-9 h-5', thumb: 'w-4 h-4', thumbActive: 'left-[18px]', thumbInactive: 'left-0.5' },
        lg: { track: 'w-11 h-6', thumb: 'w-5 h-5', thumbActive: 'left-[22px]', thumbInactive: 'left-0.5' }
    }

    return (
        <div className="space-y-0">
            <div
                role="switch"
                aria-checked={checked}
                aria-disabled={disabled}
                tabIndex={disabled ? -1 : 0}
                onClick={() => !disabled && onChange(!checked)}
                onKeyDown={e => !disabled && (e.key === ' ' || e.key === 'Enter') && onChange(!checked)}
                className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg border
                    transition-all duration-200 select-none
                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    ${checked
                        ? error
                            ? 'border-error/40 bg-error/5'
                            : 'border-brand/40 bg-brand/5'
                        : error
                            ? 'border-error/30 hover:border-error/50'
                            : 'border-border-subtle hover:border-border-med hover:bg-ink-lower/5'
                    }
                `}
            >
                {/* Track */}
                <div className={`
                    ${sizeClasses[size].track} rounded-full relative shrink-0 transition-colors duration-200
                    ${checked
                        ? error ? 'bg-error' : 'bg-brand'
                        : 'bg-surface-accent border border-border-med'
                    }
                `}>
                    <div className={`
                        absolute top-0.5 ${sizeClasses[size].thumb} rounded-full bg-white shadow-sm
                        transition-all duration-200 
                        ${checked ? sizeClasses[size].thumbActive : sizeClasses[size].thumbInactive}
                    `} />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <p className={`text-sm font-medium leading-tight
                            ${error ? 'text-error' : 'text-ink-high'}`}>
                            {label}
                        </p>
                        {error && <Warning size={12} className="text-error shrink-0" weight="fill" />}
                    </div>
                    {description && (
                        <p className={`text-xs truncate mt-0.5 ${error ? 'text-error/80' : 'text-ink-low'}`}>
                            {description}
                        </p>
                    )}
                    {hint && !error && (
                        <p className="text-[10px] text-ink-lower mt-1">{hint}</p>
                    )}
                </div>
            </div>

            {checked && children && !disabled && (
                <div className="pl-4 border-l-2 border-brand/20 mt-2 pt-2 space-y-3
                    animate-[expandDown_0.2s_ease-out]">
                    {children}
                </div>
            )}
        </div>
    )
}

// ─── Advanced Payment Options ─────────────────────────────────────────────────

export interface PaymentOption {
    id: string
    label: string
    description?: string
    icon: React.ReactNode
    disabled?: boolean
    badge?: string
}

interface PaymentToggleGroupProps {
    options: PaymentOption[]
    value: string
    onChange: (id: string) => void
    columns?: 2 | 3 | 4
    size?: 'sm' | 'md' | 'lg'
}

export function PaymentToggleGroup({
    options,
    value,
    onChange,
    columns = 3,
    size = 'md'
}: PaymentToggleGroupProps) {
    const sizeClasses = {
        sm: 'py-2 text-[10px]',
        md: 'py-3 text-xs',
        lg: 'py-4 text-sm'
    }

    return (
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {options.map(opt => {
                const active = value === opt.id
                return (
                    <button
                        key={opt.id}
                        type="button"
                        onClick={() => !opt.disabled && onChange(active ? '' : opt.id)}
                        disabled={opt.disabled}
                        className={`
                            relative flex flex-col items-center justify-center gap-1.5 rounded-lg border
                            font-medium transition-all duration-200
                            ${sizeClasses[size]}
                            ${opt.disabled
                                ? 'opacity-40 cursor-not-allowed border-border-subtle bg-bg-tertiary/20'
                                : active
                                    ? 'border-brand/50 text-brand bg-brand/10 shadow-sm shadow-brand/10'
                                    : 'border-border-subtle text-ink-low hover:border-border-med hover:text-ink-med hover:bg-bg-tertiary/30'
                            }
                        `}
                    >
                        {opt.badge && (
                            <span className="absolute -top-2 -right-2 text-[8px] px-1.5 py-0.5 rounded-full
                                bg-brand/20 text-brand border border-brand/30">
                                {opt.badge}
                            </span>
                        )}
                        <span className={`transition-transform duration-200 ${active ? 'scale-110' : ''}`}>
                            {opt.icon}
                        </span>
                        <span>{opt.label}</span>
                        {opt.description && (
                            <span className="text-[8px] text-ink-lower mt-0.5">{opt.description}</span>
                        )}
                    </button>
                )
            })}
        </div>
    )
}

// ─── InfoBox with variants ────────────────────────────────────────────────────

export interface InfoBoxProps {
    icon?: React.ReactNode
    title: string
    children: React.ReactNode
    variant?: 'brand' | 'neutral' | 'success' | 'warning' | 'error'
    size?: 'sm' | 'md' | 'lg'
    dismissible?: boolean
    onDismiss?: () => void
}

export function InfoBox({
    icon,
    title,
    children,
    variant = 'brand',
    size = 'md',
    dismissible = false,
    onDismiss
}: InfoBoxProps) {
    const [isVisible, setIsVisible] = useState(true)

    if (!isVisible) return null

    const variants = {
        brand: 'border-brand/25 bg-brand/5 text-brand',
        neutral: 'border-border-subtle bg-bg-tertiary/30 text-ink-low',
        success: 'border-green-500/25 bg-green-500/5 text-green-600',
        warning: 'border-yellow-500/25 bg-yellow-500/5 text-yellow-600',
        error: 'border-error/25 bg-error/5 text-error'
    }

    const sizeClasses = {
        sm: 'px-3 py-2 text-xs',
        md: 'px-4 py-3 text-sm',
        lg: 'px-5 py-4 text-base'
    }

    const handleDismiss = () => {
        setIsVisible(false)
        onDismiss?.()
    }

    return (
        <div className={`rounded-lg border ${variants[variant]} ${sizeClasses[size]} relative`}>
            <div className="flex items-start gap-2.5">
                {icon && <span className="shrink-0 mt-0.5">{icon}</span>}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold uppercase tracking-wider">{title}</span>
                    </div>
                    <div className="text-xs leading-relaxed">{children}</div>
                </div>
                {dismissible && (
                    <button
                        onClick={handleDismiss}
                        className="shrink-0 p-1 rounded-md hover:bg-black/5 transition-colors"
                        aria-label="Zamknij"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>
        </div>
    )
}

// ─── Readonly value display with copy ─────────────────────────────────────────

export function ReadonlyValue({
    value,
    className = '',
    copyable = false,
    monospace = false,
    label
}: {
    value: React.ReactNode
    className?: string
    copyable?: boolean
    monospace?: boolean
    label?: string
}) {
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        if (typeof value === 'string') {
            navigator.clipboard.writeText(value)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    return (
        <div className="space-y-1">
            {label && <span className="text-[10px] text-ink-lower uppercase tracking-wider">{label}</span>}
            <div className={`
                form-input bg-surface-accent flex items-center justify-between gap-2
                ${monospace ? 'font-mono text-xs' : 'text-sm font-medium text-brand'}
                ${className}
            `}>
                <span className="truncate">{value}</span>
                {copyable && typeof value === 'string' && (
                    <button
                        type="button"
                        onClick={handleCopy}
                        className="shrink-0 p-1 rounded-md hover:bg-black/10 transition-colors"
                        title={copied ? 'Skopiowano!' : 'Kopiuj'}
                    >
                        {copied ? <CheckCircle size={14} className="text-green-500" /> : <Copy size={14} />}
                    </button>
                )}
            </div>
        </div>
    )
}

// ─── Grid helpers with responsive breakpoints ─────────────────────────────────

export function FieldGrid({
    cols = 2,
    children,
    className = '',
    gap = 3
}: {
    cols?: 2 | 3 | 4 | { sm?: number; md?: number; lg?: number }
    children: React.ReactNode
    className?: string
    gap?: 1 | 2 | 3 | 4 | 5 | 6
}) {
    let gridClass = ''

    if (typeof cols === 'number') {
        gridClass = {
            2: 'grid-cols-1 sm:grid-cols-2',
            3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
            4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
        }[cols] || 'grid-cols-1 sm:grid-cols-2'
    } else {
        const sm = cols.sm || 1
        const md = cols.md || sm
        const lg = cols.lg || md
        gridClass = `grid-cols-1 sm:grid-cols-${sm} md:grid-cols-${md} lg:grid-cols-${lg}`
    }

    const gapClass = `gap-${gap}`

    return <div className={`grid ${gridClass} ${gapClass} ${className}`}>{children}</div>
}

export function FullWidth({ children }: { children: React.ReactNode }) {
    return <div className="col-span-full">{children}</div>
}

// ─── Currency input with Polish formatting ───────────────────────────────────

interface CurrencyInputProps extends Omit<TextInputProps, 'onChange' | 'value' | 'mask'> {
    value: number
    onChange: (value: number) => void
    min?: number
    max?: number
}

export function CurrencyInput({
    value,
    onChange,
    min,
    max,
    ...props
}: CurrencyInputProps) {
    const [displayValue, setDisplayValue] = useState('')
    const [isFocused, setIsFocused] = useState(false)

    const formatPLN = (num: number) => {
        return new Intl.NumberFormat('pl-PL', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(num)
    }

    useEffect(() => {
        if (!isFocused) {
            setDisplayValue(formatPLN(value))
        }
    }, [value, isFocused])

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(true)
        setDisplayValue(value.toString().replace('.', ','))
        props.onFocus?.(e)
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false)
        let num = parseFloat(e.target.value.replace(',', '.')) || 0
        if (min !== undefined) num = Math.max(num, min)
        if (max !== undefined) num = Math.min(num, max)
        onChange(num)
        props.onBlur?.(e)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/[^0-9,]/g, '')
        setDisplayValue(raw)
    }

    return (
        <TextInput
            {...props}
            value={displayValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            adornmentEnd={<span className="text-ink-low">zł</span>}
            inputMode="decimal"
        />
    )
}

// ─── PESEL input with validation ────────────────────────────────────────────

interface PeselInputProps extends Omit<TextInputProps, 'onChange' | 'value' | 'mask'> {
    value: string
    onChange: (value: string) => void
    required?: boolean
}

export function PeselInput({ value, onChange, required = true, ...props }: PeselInputProps) {
    const validatePesel = (pesel: string): string | undefined => {
        // Empty check
        if (!pesel || pesel.length === 0) {
            return required ? 'PESEL jest wymagany' : undefined
        }

        // Length check
        if (pesel.length !== 11) {
            return 'PESEL musi zawierać 11 cyfr'
        }

        // Only digits check
        if (!/^\d{11}$/.test(pesel)) {
            return 'PESEL może zawierać tylko cyfry'
        }

        // Month validation (birth date)
        const month = parseInt(pesel.substring(2, 4))
        if (month % 20 > 12) { // After 2000: 21-32, before 2000: 1-12
            return 'Nieprawidłowy miesiąc w numerze PESEL'
        }

        // Day validation
        const day = parseInt(pesel.substring(4, 6))
        if (day < 1 || day > 31) {
            return 'Nieprawidłowy dzień w numerze PESEL'
        }

        // Checksum validation - official algorithm
        const weights = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3]
        let sum = 0

        for (let i = 0; i < 10; i++) {
            sum += parseInt(pesel[i]) * weights[i]
        }

        let checksum = 10 - (sum % 10)
        if (checksum === 10) checksum = 0

        const actualChecksum = parseInt(pesel[10])

        if (actualChecksum !== checksum) {
            return 'Nieprawidłowa suma kontrolna PESEL'
        }

        return undefined
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value
        // Allow empty string
        if (raw === '') {
            onChange('')
            return
        }
        onChange(raw)
    }

    return (
        <TextInput
            {...props}
            value={value}
            onChange={handleChange}
            mask={(v) => {
                // Only allow digits, limit to 11
                return v.replace(/\D/g, '').slice(0, 11)
            }}
            validate={validatePesel}
            maxLength={11}
            placeholder="00000000000"
            inputMode="numeric"
            autoComplete="off"
        />
    )
}

// ─── IBAN input with formatting ────────────────────────────────────────────

interface IbanInputProps extends Omit<TextInputProps, 'onChange' | 'value' | 'mask'> {
    value: string
    onChange: (value: string) => void
}

export function IbanInput({ value, onChange, ...props }: IbanInputProps) {
    const formatIBAN = (iban: string): string => {
        const cleaned = iban.replace(/\s/g, '').toUpperCase()
        const groups = cleaned.match(/.{1,4}/g)
        return groups ? groups.join(' ') : cleaned
    }

    const validateIBAN = (iban: string): string | undefined => {
        if (!iban) return undefined // Optional field
        const cleaned = iban.replace(/\s/g, '')
        if (!cleaned.startsWith('PL')) return 'IBAN musi zaczynać się od PL'
        if (cleaned.length !== 28) return 'IBAN musi zawierać PL + 26 cyfr'
        if (!/^PL\d{26}$/.test(cleaned)) return 'Nieprawidłowy format IBAN'
        return undefined
    }

    return (
        <TextInput
            {...props}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            mask={(v) => formatIBAN(v)}
            validate={validateIBAN}
            maxLength={35}
            placeholder="PL00 0000 0000 0000 0000 0000 0000"
            className="font-mono"
        />
    )
}

// ─── Contract number generator ─────────────────────────────────────────────

interface ContractNumberInputProps extends Omit<TextInputProps, 'onChange' | 'value'> {
    value: string
    onChange: (value: string) => void
    prefix: string
}

export function ContractNumberInput({
    value,
    onChange,
    prefix,
    ...props
}: ContractNumberInputProps) {
    const generateNumber = () => {
        const date = new Date()
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
        return `${prefix}/${random}/${month}/${year}`
    }

    return (
        <div className="flex gap-2">
            <TextInput
                {...props}
                value={value}
                onChange={onChange}
                className="flex-1"
                placeholder={`np. ${prefix}/001/01/2026`}
            />
            <button
                type="button"
                onClick={() => onChange(generateNumber())}
                className="btn-ghost flex items-center gap-1.5 px-3 border border-border-subtle 
                    rounded-lg text-xs shrink-0 hover:text-brand hover:border-brand/40 
                    transition-colors"
                title="Generuj automatycznie"
            >
                <ArrowRight size={12} /> Auto
            </button>
        </div>
    )
}