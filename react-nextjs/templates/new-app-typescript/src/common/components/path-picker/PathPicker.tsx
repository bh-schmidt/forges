'use client'

import { pickPath, PickPathInput } from "@/ipcs/dialogs/pickPath"
import { CSSProperties, useContext, useState } from "react"
import './PathPicker.scss'
import { AppFileConfigContext } from "./PathPickerConfigProviderProps"

export interface AppFileStyles {
    containerClass?: string
    containerStyle?: CSSProperties
    inputClass?: string
    inputStyle?: CSSProperties
    buttonClass?: string
    buttonStyle?: CSSProperties
}

export interface AppFileProps extends Omit<React.ComponentProps<'div'>, 'style' | 'className' | 'onChange' | 'title'>, AppFileStyles {
    selectorOptions: PickPathInput
    buttonLabel?: string
    disabled?: boolean
    onChange?: (paths: string[]) => void
}

export function PathPicker(props: AppFileProps) {
    const config = useContext(AppFileConfigContext)
    props = { ...config.defaults, ...props }
    const {
        buttonLabel,
        selectorOptions,
        containerClass,
        containerStyle,
        inputClass,
        inputStyle,
        buttonClass,
        buttonStyle,
        disabled,
        onChange,
        ...rest
    } = props

    const styles: AppFileStyles = {
        containerClass: `${config.prepend?.containerClass} ${containerClass} ${config.append?.containerClass}`,
        inputClass: `${config.prepend?.inputClass} ${inputClass} ${config.append?.inputClass}`,
        buttonClass: `${config.prepend?.buttonClass} ${buttonClass} ${config.append?.buttonClass}`,
        containerStyle: { ...config.prepend?.containerStyle, ...containerStyle, ...config.prepend?.containerStyle },
        inputStyle: { ...config.prepend?.inputStyle, ...inputStyle, ...config.prepend?.inputStyle },
        buttonStyle: { ...config.prepend?.buttonStyle, ...buttonStyle, ...config.prepend?.buttonStyle },
    };

    const [paths, setPaths] = useState<string[]>([])

    return <div
        {...rest}
        className={`app-file-container ${styles.containerClass}`}
        style={styles.containerStyle}
        onClick={async (ev) => {
            rest?.onClick?.(ev)
            if (ev.isDefaultPrevented()) {
                return
            }

            ev.preventDefault()

            const result = await pickPath(selectorOptions)

            const paths = result.value ?? []
            setPaths(paths)
            onChange?.(paths)
        }}
    >
        <input
            className={`app-file-input ${styles.inputClass}`}
            style={styles.inputStyle} value={paths.join('   ')}
            readOnly
            disabled={disabled}
        />

        <button className={`app-file-button ${styles.buttonClass}`} style={styles.buttonStyle} disabled={disabled}>{buttonLabel ?? 'Select'}</button>
    </div>
}