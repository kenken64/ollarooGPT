declare module 'react-tooltip' {
    import * as React from 'react';
  
    interface ReactTooltipProps {
      id?: string;
      place?: 'top' | 'right' | 'bottom' | 'left';
      type?: 'dark' | 'success' | 'warning' | 'error' | 'info' | 'light';
      effect?: 'float' | 'solid';
      multiline?: boolean;
      className?: string;
      delayHide?: number;
      delayShow?: number;
      delayUpdate?: number;
      border?: boolean;
      getContent?: (dataTip: string) => React.ReactNode;
      afterShow?: () => void;
      afterHide?: () => void;
      scrollHide?: boolean;
      clickable?: boolean;
      overridePosition?: (
        position: { left: number; top: number },
        currentEvent: Event,
        currentTarget: HTMLElement,
        node: HTMLElement,
        place: string,
        desiredPlace: string,
        effect: string,
        offset: object
      ) => { left: number; top: number };
    }
  
    const ReactTooltip: React.FC<ReactTooltipProps>;
  
    export default ReactTooltip;
  }