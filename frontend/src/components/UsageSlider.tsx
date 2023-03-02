import {
  Slider,
  SliderFilledTrack,
  SliderProps,
  SliderTrack,
  Text,
} from "@chakra-ui/react";
import { FC } from "react";
import { formatBytes } from "utils/format";

const iconProps = {
  baseStyle: {
    w: 5,
    h: 5,
  },
};

type UsageSliderProps = {
  used: number;
  total: number | null;
} & SliderProps;
export const UsageSlider: FC<UsageSliderProps> = (props) => {
  const { used, total, ...restOfProps } = props;
  const isUnlimited = total === 0 || total === null;
  const isReached = !isUnlimited && (used / total) * 100 >= 100;
  return (
    <>
      <Slider
        orientation="horizontal"
        value={isUnlimited ? 100 : Math.min((used / total) * 100, 100)}
        colorScheme={isReached ? "red" : "primary"}
        {...restOfProps}
      >
        <SliderTrack h="6px" borderRadius="full">
          <SliderFilledTrack borderRadius="full" />
        </SliderTrack>
      </Slider>
      <Text
        fontSize="xs"
        fontWeight="medium"
        color="gray.600"
        _dark={{
          color: "gray.400",
        }}
      >
        {formatBytes(used)} /{" "}
        {isUnlimited ? (
          <Text as="span" fontFamily="system-ui">
            ∞
          </Text>
        ) : (
          formatBytes(total)
        )}
      </Text>
    </>
  );
};
