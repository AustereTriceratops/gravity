import { Input, Slider, Stack } from "@mui/material";

export const InputSlider = (props) => {
    const {value, setValue, step, min, max, label} = props;

    return (
        <Stack
            direction='row'
            alignItems='center'
            sx={{
                color: 'white',
                fontWeight: '600',
                gap: '20px'
            }}
        >
            {label}
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
                onChange={(ev) => {
                    setValue(ev.target.value)}}
                sx={{
                    color: 'white',
                    textAlign: 'center',
                }}
            />
        </Stack>
    )
}