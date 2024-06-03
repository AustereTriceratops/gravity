import { Input, Slider, Stack } from "@mui/material";

export const InputSlider = (props) => {
    const {value, setValue, step, min, max} = props;

    return (
        <Stack direction='row'>
            <Slider 
                value={value}
                step={step}
                min={min}
                max={max}
                
                onChange={(ev) => setValue(ev.target.value)}
            />
            <Input
                value={value}
                type='numeric'
                step={step}
                min={min}
                max={max}

                onChange={(ev) => setValue(ev.target.value)}
                sx={{
                    color: 'white'
                }}
            />
        </Stack>
    )
}