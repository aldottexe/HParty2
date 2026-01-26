type TextFieldProps = {
   id: string
   label: string
   type: "text"
   value: string | number | typeof NaN | undefined
   setValue: (value: string) => void
}

type NumberFieldProps = {
   id: string
   label: string
   type: "number"
   value: string | number | undefined
   setValue: (value: number) => void
}

type p = TextFieldProps | NumberFieldProps

export default function Field({ id, label, type, value, setValue }: p) {
   return (
      <div>
         <input
            id={id}
            type={type}
            value={value?.toString()}
            onChange={(e) => type === "number" ? setValue(parseInt(e.target.value)) : setValue(e.target.value)}
            className="rounded-md block bg-g5 text-g1 px-3 py-1 w-full"
         />
         <label className="pl-3 block text-g1" htmlFor={id}>{label}</label>
      </div>
   )
}
