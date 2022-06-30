import * as React from 'react';
import classNames from 'classnames';
import nextId from "react-id-generator";

interface IPropsBase {
    label?: string;
    maxLength?: number;
    info?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    invalid?: boolean;
    inlineLabel?: boolean;
    labelHidden?: boolean;
    tabindex?: number;
    fullWidth?: boolean;
    boxedStyle?: boolean;
    boxedLable?: boolean;
    placeholder?: string;
    size?: 'medium' | 'large' | 'x-large'; // default: 'medium'
}

interface IPropsText extends IPropsBase {
    type: 'text';
    value: string;
    onChange(newValue: string): void;
}

interface IPropsPassword extends IPropsBase {
    type: 'password';
    value: string;
    onChange(newValue: string): void;
}

interface IPropsNumber extends IPropsBase {
    type: 'number';
    value: number;
    onChange(newValue: number): void;
}

type IProps = IPropsText | IPropsNumber | IPropsPassword;

interface IState {
    value: string | number;
    invalid: boolean;
}

export class Input extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);

        this.state = {
            value: this.props.value ?? '',
            invalid: this.props.invalid ?? false,
        };

        this.handleChange = this.handleChange.bind(this);
    }

    htmlId = nextId();

    handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        this.setState({ value: event.target.value });
        if (this.props.type === 'number') {
            this.props.onChange(Number(event.target.value));
        } else {
            this.props.onChange(event.target.value);
        }

        if (this.props.maxLength && !this.props.invalid) {
            this.setState({ invalid: event.target.value.length > this.props.maxLength });
        }
    }

    componentDidUpdate(prevProps: any) {
        if (prevProps.value !== this.props.value) {
            this.setState({value: this.props.value});
        }
    }

    render() {
        const classes = classNames('sd-input', {
            'sd-input--inline-label': this.props.inlineLabel,
            'sd-input--required': this.props.required,
            'sd-input--disabled': this.props.disabled,
            'sd-input--full-width': this.props.fullWidth,
            'sd-input--invalid': this.props.invalid || this.state.invalid,
            'sd-input--medium': this.props.size === undefined,
            [`sd-input--${this.props.size}`]: this.props.size || this.props.size !== undefined,
            'sd-input--boxed-style': this.props.boxedStyle,
            'sd-input--boxed-label': this.props.boxedLable,
        });
        const labelClasses = classNames('sd-input__label', {
            'a11y-only': this.props.labelHidden,
            'sd-input__label--boxed': this.props.boxedLable,
        });

        return (
            <div className={classes}>
                <label className={labelClasses} htmlFor={this.htmlId} id={this.htmlId + 'label'}
                        tabIndex={this.props.tabindex === undefined ? undefined : -1}>
                    {this.props.label}
                </label>

                <input className='sd-input__input'
                    type={this.props.type ?? 'text'}
                    id={this.htmlId}
                    value={this.state.value}
                    aria-describedby={this.htmlId + 'label'}
                    tabIndex={this.props.tabindex}
                    onChange={this.handleChange}
                    placeholder={this.props.placeholder}
                    disabled={this.props.disabled} />

                {this.props.maxLength ?
                    <div className='sd-input__char-count'>
                        {this.state.value.toString().length} / {this.props.maxLength}
                    </div>
                    : null}

                <div className='sd-input__message-box'>
                    {this.props.info && !this.props.invalid && !this.state.invalid ?
                        <div className='sd-input__hint'>{this.props.info}</div> : null}
                    {this.props.invalid || this.state.invalid ?
                        <div className='sd-input__message'>{this.props.error}</div>
                        : null}
                </div>
            </div>
        );
    }
}
