import React from "react";
import { View } from "react-native";
import { MARGIN } from "./Config";
import SortableList from "./SortableList";
import Tile from "./tile";
const tiles = [{ id: "spent" }, { id: "cashback" }, { id: "recent" }];

const Widget = () => {
  return (
    <View style={{ paddingHorizontal: MARGIN }}>
      <SortableList
        editing={true}
        onDragEnd={(positions) =>
          console.log(JSON.stringify(positions, null, 2))
        }
      >
        {[...tiles].map((tile, index) => (
          <Tile
            onLongPress={() => true}
            key={tile.id + "-" + index}
            id={tile.id}
          />
        ))}
      </SortableList>
    </View>
  );
};

export default Widget;
