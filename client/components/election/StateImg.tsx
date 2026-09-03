import Image from "next/image";
import finished from "./png files/finished.png";
import not_started from "./png files/not_started.png";

interface NotStartedProps {
  Form_state: string;
}

function StateImg({ Form_state }: NotStartedProps) {
  return (
    <div>
      {Form_state === "Not_Started" && (
        <Image
          src={not_started}
          alt="Not Started"
          className="xs:w-[100px] sm:w-[150px] md:w-[200px]  w-[150px]"
        />
      )}
      {Form_state === "Finished" && (
        <Image
          src={finished}
          alt="Finished"
          className="xs:w-[100px] sm:w-[150px] md:w-[200px]  w-[150px]"
        />
      )}
    </div>
  );
}

export default StateImg;
