// Implementation of react-native-maps MapView, Polyline, and Marker in mapbox-gl-js for the web

import React, { useState, useEffect, useContext, useRef } from "react";

import mapboxgl from "mapbox-gl";

type MapContextType = {
  map: mapboxgl.Map | null;
  isStyleLoaded: boolean;
};
const MapContext = React.createContext<MapContextType>({
  map: null,
  isStyleLoaded: false,
});

type MapViewProps = {
  style: any;
  initialRegion: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  children: React.ReactNode;
};

export class MapView extends React.Component<MapViewProps> {
  map: mapboxgl.Map | null = null;
  mapContainer: HTMLDivElement | null = null;

  state = {
    isStyleLoaded: false,
  };

  componentDidMount() {
    // @ts-ignore token is set in webpack config from .env
    mapboxgl.accessToken = process.env.MAPBOX_ACCESS_TOKEN;
    const { initialRegion } = this.props;
    this.map = new mapboxgl.Map({
      container: this.mapContainer!,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [initialRegion.longitude, initialRegion.latitude],
      zoom: 10,
    });
    this.map.once("styledata", () => {
      this.setState({ isStyleLoaded: true });
    });
  }

  componentWillUnmount() {
    this.map?.remove();
  }

  render() {
    const { style, children } = this.props;
    return (
      <div
        style={style}
        ref={(el) => (this.mapContainer = el)}
        className="mapContainer"
      >
        <MapContext.Provider
          value={{ map: this.map, isStyleLoaded: this.state.isStyleLoaded }}
        >
          {children}
        </MapContext.Provider>
      </div>
    );
  }
}

type MarkerProps = {
  coordinate: {
    latitude: number;
    longitude: number;
  };
  title: string;
  description?: string;
  children: React.ReactNode;
};

let nextMarkerId = 0;
export const Marker = (props: MarkerProps) => {
  const { coordinate, children, title } = props;
  const pointDataSource = useRef<GeoJSON.Feature<GeoJSON.Geometry> | null>(
    null,
  );
  const { map, isStyleLoaded } = useContext(MapContext);
  const id = `marker-${nextMarkerId++}`;

  // TODO: this just adds the title as a text layer, but i want to use an icon actually
  useEffect(() => {
    if (!map || !isStyleLoaded) {
      return;
    }
    if (!pointDataSource.current) {
      const data = {
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: [coordinate.longitude, coordinate.latitude],
        },
        properties: { title },
      };
      map.addSource(id, { type: "geojson", data });
      map.addLayer({
        id,
        source: id,
        type: "symbol",
        paint: {
          "text-color": "red",
        },
        layout: {
          "text-field": ["get", "title"],
          "text-rotation-alignment": "auto",
          "text-allow-overlap": true,
          "text-anchor": "top",
        },
      });
      pointDataSource.current = data;
    } else {
      // @ts-ignore see `data` above
      pointDataSource.current.geometry.coordinates = [
        coordinate.longitude,
        coordinate.latitude,
      ];
      // @ts-ignore data can be set on geojson source
      map.getSource(id)?.setData(pointDataSource.current);
    }
  }, [map, isStyleLoaded, coordinate]);

  return null;
};

// TODO: implement
export const Polyline = (props: any) => null;
