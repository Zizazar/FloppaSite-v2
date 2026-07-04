/**
 * @component @name ModloaderIcon
 * @description SVG icon for modloader component.

 *
 * @param {String} name - Name of the modloader (e.g., "Fabric", "Forge", "NeoForge").
 * @param {Object} props - Additional props for the SVG element.
 * @returns {JSX.Element} JSX Element
 *
 */

import { JSX } from "react/jsx-dev-runtime";
/**
* like in a Lucide SVG
* declare const Box: react.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & react.RefAttributes<SVGSVGElement>>;
*/

interface ModloaderIconProps extends React.SVGProps<SVGSVGElement> {
  name: "Fabric" | "Forge" | "NeoForge";
}

export default function ModloaderIcon({ name, ...props }: ModloaderIconProps) {
  const icons: { [key: string]: JSX.Element } = {
    "Fabric": 
        (<svg xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd"viewBox="0 0 24 24" {...props}><path fill="none" d="M0 0h24v24H0z"></path><path fill="none" stroke="currentColor" strokeWidth="23" d="m820 761-85.6-87.6c-4.6-4.7-10.4-9.6-25.9 1-19.9 13.6-8.4 21.9-5.2 25.4 8.2 9 84.1 89 97.2 104 2.5 2.8-20.3-22.5-6.5-39.7 5.4-7 18-12 26-3 6.5 7.3 10.7 18-3.4 29.7-24.7 20.4-102 82.4-127 103-12.5 10.3-28.5 2.3-35.8-6-7.5-8.9-30.6-34.6-51.3-58.2-5.5-6.3-4.1-19.6 2.3-25 35-30.3 91.9-73.8 111.9-90.8" transform="matrix(.08671 0 0 .0867 -49.8 -56)"></path></svg>),
    "Forge":
        (<svg xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" viewBox="0 0 24 24" {...props}><path fill="none" d="M0 0h24v24H0z"></path><path fill="none" stroke="currentColor" strokeWidth="2" d="M2 7.5h8v-2h12v2s-7 3.4-7 6 3.1 3.1 3.1 3.1l.9 3.9H5l1-4.1s3.8.1 4-2.9c.2-2.7-6.5-.7-8-6"></path></svg>),
    "NeoForge":
        (<svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 24 24" {...props}><g fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19.2v2m0-2v2M8.4 1.3c.5 1.5.7 3 .1 4.6-.2.5-.9 1.5-1.6 1.5m8.7-6.1c-.5 1.5-.7 3-.1 4.6.2.6.9 1.5 1.6 1.5M3.6 15.8H1.9m18.5 0h1.7M3.2 12.1H1.5m19.3 0h1.8M8.1 12.7v1.6m7.8-1.6v1.6M10.8 18H12m0 1.2L10.8 18m2.4 0H12m0 1.2 1.2-1.2M4 9.7c-.5 1.2-.8 2.4-.8 3.7 0 3.1 2.9 6.3 5.3 8.2.9.7 2.2 1.1 3.4 1.1M12 4.9c-1.1 0-2.1.2-3.2.7M20 9.7c.5 1.2.8 2.4.8 3.7 0 3.1-2.9 6.3-5.3 8.2-.9.7-2.2 1.1-3.4 1.1M12 4.9c1.1 0 2.1.2 3.2.7M4 9.7c-.2-1.8-.3-3.7.5-5.5s2.2-2.6 3.9-3M20 9.7c.2-1.9.3-3.7-.5-5.5s-2.2-2.6-3.9-3M12 21.2l-2.4.4m2.4-.4 2.4.4"></path></g></svg>)
    };

    return icons[name] || null;
}
      