import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createPopper } from '@popperjs/core';

export interface IMenuItem {
    label: string;
    icon?: string;
    onSelect(): void;
}

export interface ISubmenu {
    type: 'submenu';
    label: string;
    icon?: string;
    items: Array<IMenuItem | ISubmenu | IMenuGroup | 'divider'>;
}

export interface IMenuGroup {
    type: 'group';
    label?: string;
    items: Array<IMenuItem | ISubmenu | IMenuGroup | 'divider'>;
}

interface IMenu {
    append?: boolean;
    label?: string;
    align?: 'left' | 'right';
    items: Array<IMenuItem | ISubmenu | IMenuGroup | 'divider'>;
    header?: Array<IMenuItem | ISubmenu | IMenuGroup | 'divider'>;
    footer?: Array<IMenuItem | ISubmenu | IMenuGroup | 'divider'>;
    children: React.ReactNode;
}

export const Dropdown = ({
    items,
    header,
    footer,
    children,
    append,
}: IMenu) => {
    const [open, setOpen] = React.useState(false);
    const [change, setChange] = React.useState(false);
    const [menuAppend, setMenuAppend] = React.useState(<p></p>);
    const DROPDOWN_ID = "react-placeholder";
    const ref = React.useRef(null);
    const refSubMenu = React.useRef(null);
    const buttonRef = React.useRef(null);
    const refButtonSubMenu = React.useRef(null);

    const headerElements = header?.map((el, index) => {
        return each(el, index);
    });

    const dropdownElements = items.map((el, index) => {
        return each(el, index);
    });

    const footerElements = footer?.map((el, index) => {
        return each(el, index);
    });

    React.useEffect(() => {
        const existingElement = document.getElementById(DROPDOWN_ID);
        if (!existingElement) {
            const el = document.createElement("div");
            el.id = DROPDOWN_ID;
            // style placeholder
            el.style.position = 'absolute';
            el.style.top = '0';
            el.style.left = '0';
            el.style.width = '1px';
            el.style.height = '1px';

            document.body.appendChild(el);
        }

    }, [change]);

    React.useLayoutEffect(() => {
        if (append && change) {
            addInPlaceholder();
        }
        setChange(true);
    }, [open]);

    // structure for append menu
    function createAppendMenu(top: number, left: number) {
        if (header && footer) {
            return (
                <div className='dropdown__menu dropdown__menu--has-head-foot'
                    style={{
                        display: 'block',
                        top: top,
                        left: left,
                    }}  >
                    <ul className='dropdown__menu-header'>
                        {headerElements}
                    </ul>
                    <ul className='dropdown__menu-body'>
                        {dropdownElements}
                    </ul>
                    <ul className='dropdown__menu-footer dropdown__menu-footer--has-list '>
                        {footerElements}
                    </ul>
                </div>
            );
        } else if (header) {
            return (
                <div className='dropdown__menu dropdown__menu--has-head-foot'
                    style={{
                        display: 'block',
                        top: top,
                        left: left,
                    }}  >
                    <ul className='dropdown__menu-header'>
                        {headerElements}
                    </ul>
                    <ul className='dropdown__menu-body'>
                        {dropdownElements}
                    </ul>
                </div>
            );
        } else if (footer) {
            return (
                <div className='dropdown__menu dropdown__menu--has-head-foot'
                    style={{
                        display: 'block',
                        top: top,
                        left: left,
                    }}  >
                    <ul className='dropdown__menu-body'>
                        {dropdownElements}
                    </ul>
                    <ul className='dropdown__menu-footer dropdown__menu-footer--has-list '>
                        {footerElements}
                    </ul>
                </div>
            );
        } else {
            return (
                <ul className='dropdown__menu '
                    style={{
                        display: 'block',
                        top: top,
                        left: left,
                    }} >
                    {dropdownElements}
                </ul>
            );
        }
    }

    // toggle menu
    function toggleDisplay() {
        if (!open) {
            setOpen(true);
            setMenuAppend(createAppendMenu(
                getDimensions(buttonRef.current).bottom,
                getDimensions(buttonRef.current).left));
            if (!append) {
                let menuRef = ref.current;
                let toggleRef = buttonRef.current;
                if (toggleRef && menuRef) {
                    createPopper(toggleRef, menuRef, {
                        placement: 'bottom-start',
                    });
                }
            }
            document.addEventListener('click', closeMenu);
        } else {
            setOpen(false);
            setMenuAppend(<br />);
        }
    }

    function closeMenu() {
        document.removeEventListener('click', closeMenu);
        setMenuAppend(<br />);
        setOpen(false);
    }

    // position on screen
    function getDimensions(el: any) {
        const rect = el.getBoundingClientRect();
        return {
            top: rect.top,
            bottom: rect.bottom,
            right: rect.right,
            left: rect.left,
        };
    }

    function addInPlaceholder() {
        const placeholder = document.getElementById(DROPDOWN_ID);
        return ReactDOM.render(menuAppend, placeholder);
    }

    function each(item: any, index: number) {
        if (item['type'] === 'submenu') {
            let submenuItems: any = [];
            item['items'].forEach((el: any, key: number) => {
                submenuItems.push(each(el, key));
            });
            return (
                <li key={index}>
                    <div className='dropdown' >
                        <button
                            ref={refButtonSubMenu}
                            className='dropdown__toggle dropdown-toggle'
                            onMouseOver={() => {
                                let subMenuRef = refSubMenu.current;
                                let subToggleRef = refButtonSubMenu.current;
                                if (subMenuRef && subToggleRef) {
                                    createPopper(subToggleRef, subMenuRef, {
                                        placement: 'right-start',
                                    });
                                }
                            }}>
                            {item['icon'] ? <i className={'icon-' + item['icon']}></i> : null}
                            {item['label']}
                        </button>
                        <ul ref={refSubMenu}
                            className='dropdown__menu'>
                            {submenuItems}
                        </ul>
                    </div>
                </li>
            );

        } else if (item['type'] === 'group') {
            let groupItems: any = [];
            item['items'].forEach((el: any, key: number) => {
                groupItems.push(each(el, key));
            });
            return (
                <React.Fragment key={index}>
                    <li>
                        <div className="dropdown__menu-label">{item['label']}</div>
                    </li>
                    {groupItems}
                </React.Fragment>
            );

        } else if (item === 'divider') {
            return (<li className="dropdown__menu-divider" key={index}></li>);
        } else {
            return (
                <DropdownItem
                    key={index}
                    label={item['label']}
                    icon={item['icon']}
                    onSelect={item['onSelect']} />);
        }
    }

    return (
        <div className={'dropdown ' + (open ? 'open' : '')} >
            {typeof children === 'object' ?
                (React.isValidElement(children) ? React.cloneElement(children, {
                    className: children.props.className ? (children.props.className + ' dropdown__toggle dropdown-toggle') : 'dropdown__toggle dropdown-toggle',
                    onClick: toggleDisplay,
                    ref: buttonRef,
                }) : null)
                :
                <button ref={buttonRef}
                    className=' dropdown__toggle dropdown-toggle'
                    onClick={toggleDisplay}>
                    {children}
                    <span className="dropdown__caret"></span>
                </button>}

            {append ?
                null : (function() {
                    if (header && footer) {
                        return (
                            <div className='dropdown__menu dropdown__menu--has-head-foot' ref={ref} >
                                <ul className='dropdown__menu-header'>
                                    {headerElements}
                                </ul>
                                <ul className='dropdown__menu-body'>
                                    {dropdownElements}
                                </ul>
                                <ul className='dropdown__menu-footer dropdown__menu-footer--has-list '>
                                    {footerElements}
                                </ul>
                            </div>
                        );
                    } else if (header) {
                        return (
                            <div className='dropdown__menu dropdown__menu--has-head-foot' ref={ref} >
                                <ul className='dropdown__menu-header'>
                                    {headerElements}
                                </ul>
                                <ul className='dropdown__menu-body'>
                                    {dropdownElements}
                                </ul>
                            </div>
                        );
                    } else if (footer) {
                        return (
                            <div className='dropdown__menu dropdown__menu--has-head-foot' ref={ref} >
                                <ul className='dropdown__menu-body'>
                                    {dropdownElements}
                                </ul>
                                <ul className='dropdown__menu-footer dropdown__menu-footer--has-list '>
                                    {footerElements}
                                </ul>
                            </div>
                        );
                    } else {
                        return <ul className='dropdown__menu' ref={ref} >
                            {dropdownElements}
                        </ul>;
                    }
                })()}
        </div >
    );
};

const DropdownItem = ({
    label,
    icon,
    onSelect,
}: IMenuItem) => {
    return (
        <li><button onSelect={onSelect}><i className={icon ? ('icon-' + icon) : ''}></i>{label}</button></li>
    );

};
