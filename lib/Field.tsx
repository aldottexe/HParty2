type TextFieldProps = {
   id: string
   label: string
   type: "text"
   value: string | number | typeof NaN | undefined
   setValue: (value: string) => void
   required?: boolean
   placeHolder?: string
}

type TextLongFieldProps = {
   id: string
   label: string
   type: "textLong"
   value: string | number | typeof NaN | undefined
   setValue: (value: string) => void
   required?: boolean
   placeHolder?: string
}

type NumberFieldProps = {
   id: string
   label: string
   type: "number"
   value: string | number | undefined
   setValue: (value: number) => void
   required?: boolean
   placeHolder?: string
}

type p = TextFieldProps | NumberFieldProps | TextLongFieldProps

export default function Field({ id, label, type, value, setValue, required = false, placeHolder = "" }: p) {
   return (
      <div>
         {type === "textLong" ? (
            <textarea
               id={id}
               value={value?.toString()}
               onChange={(e) => setValue(e.target.value)}
               className="rounded-md block bg-g5 text-g1 px-3 py-1 w-full h-20 resize-none"
               placeholder={placeHolder}
            />
         ) : (
            <input
               id={id}
               type={type}
               value={value?.toString()}
               onChange={(e) => type === "number" ? setValue(parseInt(e.target.value)) : setValue(e.target.value)}
               className="rounded-md block bg-g5 text-g1 px-3 py-1 w-full"
            />
         )}
         <label className="pl-3 block text-g1" htmlFor={id}>{label}{required && <span className="text-blue">*</span>}</label>
      </div>
   )
}
