import * as React from 'react';
import { cn } from '@/lib/utils';

const InputGroup = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
    return (
        <div
            ref={ref}
            className={cn(
                'relative flex w-full items-center overflow-hidden rounded-md border border-input bg-transparent transition-[color,box-shadow] has-[:focus-visible]:border-ring has-[:focus-visible]:ring-ring/50 has-[:focus-visible]:ring-[3px]',
                className
            )}
            {...props}
        />
    );
});
InputGroup.displayName = 'InputGroup';

const InputGroupInput = React.forwardRef<
    HTMLInputElement,
    React.ComponentProps<'input'>
>(({ className, type, ...props }, ref) => {
    return (
        <input
            type={type}
            ref={ref}
            className={cn(
                'placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 bg-transparent px-3 py-1 text-base shadow-none outline-none transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
                className
            )}
            {...props}
        />
    );
});
InputGroupInput.displayName = 'InputGroupInput';

const InputGroupAddon = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
    return (
        <div
            ref={ref}
            className={cn(
                'flex h-9 items-center justify-center px-3 text-muted-foreground',
                className
            )}
            {...props}
        />
    );
});
InputGroupAddon.displayName = 'InputGroupAddon';

export { InputGroup, InputGroupInput, InputGroupAddon };
