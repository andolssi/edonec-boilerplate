import {
  Controller,
  FieldError,
  get,
  useFormContext,
  useFormState,
} from "react-hook-form";

import { TRule } from "field-validator/types";

import { IComponentProps } from "./RawFilePicker";
import { RawFilePicker } from "..";
import { validateForm } from "../helpers/validateForm";

export interface IProps
  extends Omit<IComponentProps, "error" | "onChange" | "value"> {
  name: string;
  validate?: TRule[];
}
const FilePicker: React.FC<IProps> = ({
  name,
  validate,
  ...filePickerProps
}) => {
  const { control } = useFormContext();
  const { errors } = useFormState();
  const error = get(errors, name) as FieldError | undefined;

  return (
    <Controller
      rules={{ validate: validateForm(name, validate || []) }}
      name={name}
      control={control}
      render={({ field: { onChange, value, ref } }) => (
        <RawFilePicker
          name={name}
          {...filePickerProps}
          ref={ref}
          value={value}
          onChange={onChange}
          error={error?.message}
        />
      )}
    ></Controller>
  );
};

export default FilePicker;