const React = require("react");
const { createUPIPaymentGateway } = require("./index");

const UPIPaymentButton = React.forwardRef(function UPIPaymentButton(
  {
    children,
    buttonText = "Pay Now",
    className,
    gatewayOptions = {},
    onClick,
    ...buttonProps
  },
  forwardedRef
) {
  const gatewayRef = React.useRef(null);

  React.useEffect(() => {
    gatewayRef.current = createUPIPaymentGateway(gatewayOptions);

    return () => {
      if (gatewayRef.current) {
        gatewayRef.current.destroy();
        gatewayRef.current = null;
      }
    };
  }, []);

  React.useEffect(() => {
    if (gatewayRef.current) {
      gatewayRef.current.update(gatewayOptions);
    }
  }, [gatewayOptions]);

  React.useImperativeHandle(
    forwardedRef,
    () => ({
      open(overrides) {
        gatewayRef.current?.open(overrides);
      },
      close() {
        gatewayRef.current?.close();
      },
      update(options) {
        gatewayRef.current?.update(options);
      },
      destroy() {
        gatewayRef.current?.destroy();
      },
      isOpen() {
        return gatewayRef.current?.isOpen() || false;
      },
    }),
    []
  );

  const handleClick = (event) => {
    if (typeof onClick === "function") {
      onClick(event);
    }

    if (!event.defaultPrevented) {
      gatewayRef.current?.open();
    }
  };

  return React.createElement(
    "button",
    {
      ...buttonProps,
      className,
      onClick: handleClick,
      type: buttonProps.type || "button",
    },
    children || buttonText
  );
});

module.exports = {
  UPIPaymentButton,
};
