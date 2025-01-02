import { Body } from "./Body";
import { Hero } from "./hero";

export function meta() {
  return [
    { title: "ICM Tech Home" },
    { name: "description", content: "Welcome to ICM Tech home page" },
  ];
}

export default function Home() {
  return <div className="flex-1 flex flex-col"> 
    <Hero/>
    <Body/>
  </div>;
}
