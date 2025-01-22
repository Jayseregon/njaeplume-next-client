import React from "react";

// Define shared interfaces
interface BaseProps {
  children?: React.ReactNode;
  className?: string;
  nonce?: string;
}

interface ButtonProps extends BaseProps {
  "aria-label"?: string;
  isIconOnly?: boolean;
  onPress?: PressHandler;
  color?: string;
  size?: string;
  variant?: string;
}

// Add a type for event handlers
type PressEvent = React.MouseEvent | React.KeyboardEvent;
type PressHandler = (e: PressEvent) => void;

// Modify createPressHandlers to fix unused variable 'e'
const createPressHandlers = (
  handler?: PressHandler,
  includeRole: boolean = true,
) => ({
  onClick: (e: React.MouseEvent) => {
    e.preventDefault();
    handler?.(e);
  },
  onKeyDown: (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handler?.(e);
    }
  },
  ...(includeRole && { role: "button" }),
  tabIndex: 0,
});

export const Button = ({
  children,
  className,
  nonce,
  "aria-label": ariaLabel,
  isIconOnly,
  onPress,
  color,
  ...props
}: ButtonProps) => {
  const pressHandlers = createPressHandlers(onPress);

  return (
    <button
      aria-label={ariaLabel}
      className={className}
      color={color} // Keep the original color prop
      data-color={color} // Also add data-color for testing
      data-icon-only={isIconOnly}
      nonce={nonce}
      type="button"
      {...pressHandlers}
      {...props}
    >
      {children}
    </button>
  );
};

// Remove unused properties from AvatarProps
interface AvatarProps extends BaseProps {
  src?: string;
  alt?: string;
  name?: string;
}

// Update Avatar component without unused props
export const Avatar = ({
  src,
  alt,
  className,
  name,
  ...props
}: AvatarProps) => (
  <div
    aria-label={name || alt}
    className={className}
    data-name={name}
    data-testid="avatar-image"
    role="img"
  >
    <img alt={alt || name} src={src} {...props} />
  </div>
);

// Update Navbar component to fix accessibility issues
interface NavbarProps extends BaseProps {
  maxWidth?: string;
  isMenuOpen?: boolean;
  onMenuOpenChange?: (isOpen: boolean) => void;
}

export const Navbar = ({ children, className, ...props }: NavbarProps) => {
  const handleMenuToggle = () => {
    props.onMenuOpenChange?.(!props.isMenuOpen);
  };

  return (
    <nav
      className={className}
      data-is-menu-open={props.isMenuOpen}
      data-max-width={props.maxWidth}
      role="navigation"
    >
      <div
        {...createPressHandlers(handleMenuToggle)}
        data-testid="navbar-toggle"
      >
        {children}
      </div>
    </nav>
  );
};

interface NavbarContentProps extends BaseProps {
  justify?: string;
}

export const NavbarContent = ({
  children,
  justify,
  ...props
}: NavbarContentProps) => (
  <div data-justify={justify} {...props}>
    {children}
  </div>
);

export const NavbarItem = ({ children, ...props }: BaseProps) => (
  <div data-testid="navbar-item" {...props}>
    {children}
  </div>
);

export const NavbarBrand = ({ children, ...props }: BaseProps) => (
  <div data-testid="navbar-brand" {...props}>
    {children}
  </div>
);

export const NavbarMenuToggle = ({ children, ...props }: BaseProps) => (
  <button type="button" {...props}>
    {children}
  </button>
);

export const NavbarMenu = ({ children, ...props }: BaseProps) => (
  <div role="menu" {...props}>
    {children}
  </div>
);

export const NavbarMenuItem = ({ children, ...props }: BaseProps) => (
  <div data-testid="navbar-menu-item" {...props}>
    {children}
  </div>
);

export const Dropdown = ({ children, ...props }: BaseProps) => (
  <div data-testid="dropdown" {...props}>
    {children}
  </div>
);

export const DropdownTrigger = ({ children, ...props }: BaseProps) => (
  <div data-testid="dropdown-trigger" {...props}>
    {children}
  </div>
);

export const DropdownMenu = ({
  children,
  disabledKeys,
  "aria-label": ariaLabel,
  ...props
}: BaseProps & {
  disabledKeys?: string[];
  "aria-label"?: string;
}) => (
  <div
    aria-label={ariaLabel}
    data-disabled-keys={disabledKeys?.join(",")}
    role="menu"
    {...props}
  >
    {children}
  </div>
);

interface DropdownItemProps extends BaseProps {
  textValue?: string;
  showDivider?: boolean;
  onPress?: PressHandler;
  color?: string;
}

export const DropdownItem = ({
  children,
  className,
  textValue,
  showDivider,
  onPress,
  color,
  ...props
}: DropdownItemProps) => {
  const pressHandlers = createPressHandlers(onPress, false);

  return (
    <div
      className={className}
      data-color={color}
      data-show-divider={showDivider}
      data-text-value={textValue}
      role="menuitem"
      {...pressHandlers}
      {...props}
    >
      {children}
    </div>
  );
};

interface LinkProps extends BaseProps {
  href?: string;
  color?: string;
  underline?: string;
}

export const Link = ({
  children,
  href,
  className,
  color,
  underline,
  onPress,
  ...props
}: LinkProps & {
  onPress?: (e: React.MouseEvent) => void;
}) => (
  <a
    className={className}
    data-color={color}
    data-underline={underline}
    href={href}
    onClick={onPress} // Convert onPress to onClick
    {...props}
  >
    {children}
  </a>
);

export const Spinner = ({
  label,
  color,
  ...props
}: BaseProps & {
  label?: string;
  color?: string;
}) => (
  <div
    data-color={color}
    data-testid="loading-spinner"
    role="progressbar"
    {...props}
  >
    {label}
  </div>
);

// Add the Input component mock
export const Input = ({
  classNames,
  labelPlacement = "inside",
  placeholder,
  startContent,
  endContent,
  type,
  ...props
}: BaseProps & {
  placeholder?: string;
  type?: string;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  labelPlacement?: "inside" | "outside" | "outside-left";
  classNames?: { input?: string; inputWrapper?: string };
  "aria-label"?: string;
}) => (
  <div
    className={classNames?.inputWrapper}
    data-label-placement={labelPlacement}
  >
    <div>
      {startContent}
      <input
        aria-label={props["aria-label"]}
        className={classNames?.input}
        placeholder={placeholder}
        role="searchbox"
        type={type}
        {...props}
      />
      {endContent && <div className="end-content">{endContent}</div>}
    </div>
    {labelPlacement !== "inside" && placeholder && <label>{placeholder}</label>}
  </div>
);

export const Tooltip = ({
  children,
  content,
  color,
  offset = 7, // Add default value
  placement,
  ...props
}: BaseProps & {
  content: React.ReactNode;
  color?: string;
  offset?: number;
  placement?: string;
}) => (
  <div className="relative inline-block" data-testid="tooltip-wrapper">
    {children}
    <div
      className="absolute bottom-full left-1/2 transform -translate-x-1/2 -mb-2 z-10 py-0.5 px-3 bg-blue-500 text-white dark:text-black text-sm rounded-full shadow-lg text-nowrap transition-opacity duration-500 ease-in-out opacity-0"
      data-color={color}
      data-content={content}
      data-offset={offset} // Add offset to data attributes
      data-placement={placement}
      data-testid="tooltip"
      style={{
        // Use offset in positioning
        marginBottom: `-${offset}px`,
      }}
      {...props}
    >
      {typeof content === "string" ? content : null}
    </div>
  </div>
);

// Add Kbd component mock
export const Kbd = ({ children, className, ...props }: BaseProps) => (
  <kbd className={className} {...props}>
    {children}
  </kbd>
);

// Add a test to satisfy Jest's requirement
describe("NextUI Mocks", () => {
  it("exists", () => {});
  expect(Button).toBeDefined();
});
