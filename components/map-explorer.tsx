"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Era = "tang" | "yuan" | "ming" | "qing";
type Position = [number, number];

type GeoGeometry = {
  type: "Polygon" | "MultiPolygon";
  coordinates: Position[][] | Position[][][];
};

type GeoFeature = {
  type: "Feature";
  properties?: { name?: string };
  geometry: GeoGeometry;
};

type BoundaryData = {
  meta?: { source?: string; note?: string; license?: string };
  features?: GeoFeature[];
};

type MapEvent = {
  eventId?: string;
  name?: string;
  title?: string;
  date?: string | number;
  year?: string | number;
  kind?: string;
  lat: number;
  lng: number;
  note?: string;
  summary?: string;
  place?: { name?: string; modern?: string; note?: string };
};

type EventData = { events?: MapEvent[] };

type MapData = {
  boundary: BoundaryData;
  events: MapEvent[];
};

const eras: { id: Era; label: string; years: string; boundary: string; events: string }[] = [
  { id: "tang", label: "唐", years: "618—907", boundary: "data/boundaries/tang.geojson", events: "data/tang/map-events.json" },
  { id: "yuan", label: "元", years: "1271—1368", boundary: "data/boundaries/yuan.geojson", events: "data/yuan/map-events.json" },
  { id: "ming", label: "明", years: "1368—1644", boundary: "data/boundaries/ming.geojson", events: "data/events/map-events.json" },
  { id: "qing", label: "清", years: "1644—1912", boundary: "data/boundaries/qing.geojson", events: "data/qing/map-events.json" },
];

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const assetUrl = (relativePath: string) => `${basePath}/${relativePath.replace(/^\//, "")}`;
const eventName = (event: MapEvent) => event.name || event.title || "历史事件";
const eventDate = (event: MapEvent) => String(event.date ?? event.year ?? "");
const eventKey = (event: MapEvent, index: number) => event.eventId || `event-${index}`;

function projectPoint(lon: number, lat: number): Position {
  return [42 + ((lon - 69) / 73) * 876, 556 - ((lat - 14) / 49) * 505];
}

function geometryPath(geometry: GeoGeometry): string {
  const polygons: Position[][][] = geometry.type === "Polygon"
    ? [geometry.coordinates as Position[][]]
    : geometry.coordinates as Position[][][];

  return polygons.map(polygon => polygon.map(ring => ring.map(([lon, lat], index) => {
    const [x, y] = projectPoint(lon, lat);
    return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join("") + "Z").join("")).join("");
}

function featureCenter(feature: GeoFeature): Position {
  const ring = feature.geometry.type === "Polygon"
    ? (feature.geometry.coordinates as Position[][])[0]
    : (feature.geometry.coordinates as Position[][][])[0]?.[0];
  if (!ring?.length) return [0, 0];
  const lon = ring.reduce((sum, point) => sum + point[0], 0) / ring.length;
  const lat = ring.reduce((sum, point) => sum + point[1], 0) / ring.length;
  return projectPoint(lon, lat);
}

function updateMapUrl(era: Era, eventId?: string) {
  const url = new URL(window.location.href);
  url.searchParams.set("era", era);
  if (eventId) url.searchParams.set("event", eventId);
  else url.searchParams.delete("event");
  window.history.replaceState({}, "", url);
}

function Graticule() {
  const meridians = [70, 80, 90, 100, 110, 120, 130, 140];
  const parallels = [20, 30, 40, 50, 60];
  return <>
    <rect width="960" height="600" fill="#e9eee8" />
    {meridians.map(lon => {
      const [x] = projectPoint(lon, 20);
      return <g key={lon}><line className="graticule" x1={x} y1="35" x2={x} y2="560" /><text className="graticule-label" x={x + 3} y="575">{lon}°E</text></g>;
    })}
    {parallels.map(lat => {
      const [, y] = projectPoint(80, lat);
      return <g key={lat}><line className="graticule" x1="40" y1={y} x2="920" y2={y} /><text className="graticule-label" x="8" y={y - 4}>{lat}°N</text></g>;
    })}
  </>;
}

export default function MapExplorer() {
  const [era, setEra] = useState<Era>("tang");
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadIndex, setReloadIndex] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedEra = params.get("era");
    if (requestedEra && eras.some(option => option.id === requestedEra)) setEra(requestedEra as Era);
    setSelectedId(params.get("event"));
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const config = eras.find(option => option.id === era)!;
    setMapData(null);
    setError(null);
    setExpanded(false);

    Promise.all([
      fetch(assetUrl(config.boundary), { signal: controller.signal }),
      fetch(assetUrl(config.events), { signal: controller.signal }),
    ]).then(async ([boundaryResponse, eventResponse]) => {
      if (!boundaryResponse.ok || !eventResponse.ok) throw new Error("地图资料暂时无法读取");
      const [boundary, eventData] = await Promise.all([
        boundaryResponse.json() as Promise<BoundaryData>,
        eventResponse.json() as Promise<EventData>,
      ]);
      if (controller.signal.aborted) return;
      const events = (eventData.events || []).filter(event => Number.isFinite(Number(event.lat)) && Number.isFinite(Number(event.lng)));
      setMapData({ boundary, events });
      const requestedEvent = new URLSearchParams(window.location.search).get("event");
      const requestedIndex = events.findIndex((event, index) => eventKey(event, index) === requestedEvent);
      setSelectedId(requestedIndex >= 0 ? eventKey(events[requestedIndex], requestedIndex) : events.length ? eventKey(events[0], 0) : null);
      setExpanded(requestedIndex >= 10);
    }).catch(cause => {
      if (controller.signal.aborted) return;
      setError(cause instanceof Error ? cause.message : "地图资料暂时无法读取");
    });

    return () => controller.abort();
  }, [era, reloadIndex]);

  const selectedEvent = useMemo(() => mapData?.events.find((event, index) => eventKey(event, index) === selectedId) || null, [mapData, selectedId]);
  const visibleEvents = mapData?.events.slice(0, expanded ? undefined : 10) || [];
  const config = eras.find(option => option.id === era)!;

  function chooseEra(nextEra: Era) {
    if (nextEra === era) return;
    setEra(nextEra);
    setSelectedId(null);
    updateMapUrl(nextEra);
  }

  function chooseEvent(event: MapEvent, index: number) {
    const id = eventKey(event, index);
    setSelectedId(id);
    updateMapUrl(era, id);
  }

  return <section className="atlas-page" aria-labelledby="atlasTitle">
    <div className="atlas-heading">
      <div>
        <p className="eyebrow">02 / ATLAS</p>
        <h1 id="atlasTitle">疆域与事件</h1>
        <p>沿着地理位置观察历史现场。疆域轮廓为手绘简化示意，不能作为精确行政边界使用。</p>
      </div>
      <span className="atlas-heading-mark" aria-hidden="true">经纬之间<br />山河有迹</span>
    </div>

    <div className="era-switch" role="group" aria-label="选择朝代">
      {eras.map(option => <button
        key={option.id}
        type="button"
        className={`era-button ${option.id === era ? "is-active" : ""}`}
        aria-pressed={option.id === era}
        onClick={() => chooseEra(option.id)}
      >{option.label}<small>{option.years}</small></button>)}
    </div>

    <div className="atlas-layout">
      <div className="map-column">
        <div className="map-frame">
          <div className="map-corner-label">HISTORICAL ATLAS <span>·</span> 概略舆图</div>
          <svg className="atlas-svg" viewBox="0 0 960 600" role="group" aria-label={`${config.label}代疆域示意图，${mapData?.events.length || 0} 处事件点位`}>
            <Graticule />
            {mapData?.boundary.features?.map((feature, index) => <path key={index} className="region-shape" d={geometryPath(feature.geometry)}>
              <title>{feature.properties?.name || `${config.label}代区域`}</title>
            </path>)}
            {mapData?.boundary.features?.filter((_, index) => index % 2 === 0).map((feature, index) => {
              const [x, y] = featureCenter(feature);
              const name = feature.properties?.name || "";
              return name.length <= 8 ? <text key={index} className="region-label" x={x} y={y}>{name}</text> : null;
            })}
            {mapData?.events.map((event, index) => {
              const [x, y] = projectPoint(event.lng, event.lat);
              const selected = selectedId === eventKey(event, index);
              return <circle
                key={eventKey(event, index)}
                className={`event-marker ${selected ? "is-active" : ""}`}
                cx={x}
                cy={y}
                r={selected ? 9 : 5.2}
                role="button"
                tabIndex={0}
                aria-label={`${eventDate(event)} ${eventName(event)}`}
                aria-pressed={selected}
                onClick={() => chooseEvent(event, index)}
                onKeyDown={keyboardEvent => {
                  if (keyboardEvent.key === "Enter" || keyboardEvent.key === " ") {
                    keyboardEvent.preventDefault();
                    chooseEvent(event, index);
                  }
                }}
              ><title>{eventName(event)}</title></circle>;
            })}
          </svg>
          <div className="map-legend"><span><i className="legend-region" />疆域示意</span><span><i className="legend-event" />事件点位</span></div>
        </div>

        <div className="selected-event" aria-live="polite">
          {selectedEvent ? <>
            <span className="eyebrow">{eventDate(selectedEvent)} / {selectedEvent.place?.name || selectedEvent.place?.modern || "事件点位"}</span>
            <h3>{eventName(selectedEvent)}</h3>
            <p>{selectedEvent.summary || selectedEvent.note || "点击事件索引可查看相关资料。"}</p>
          </> : <p>{error || (mapData ? "暂无事件点位。" : "正在读取历史现场…")}</p>}
        </div>
      </div>

      <aside className="event-index" aria-labelledby="eventIndexTitle">
        <div className="event-index-head"><span className="eyebrow">ON THE MAP</span><h2 id="eventIndexTitle">事件索引</h2><p>{mapData ? `共 ${mapData.events.length} 处有坐标的历史事件` : error ? "地图资料读取失败" : "资料加载中…"}</p></div>
        {error ? <div className="map-loading"><p>{error}</p><button type="button" className="event-more" onClick={() => setReloadIndex(index => index + 1)}>重新加载</button></div> : <>
          <div className="event-list">
            {visibleEvents.map((event, index) => <button
              key={eventKey(event, index)}
              type="button"
              className={`event-item ${selectedId === eventKey(event, index) ? "is-active" : ""}`}
              aria-pressed={selectedId === eventKey(event, index)}
              onClick={() => chooseEvent(event, index)}
            ><span className="event-date">{eventDate(event)}</span><span><strong>{eventName(event)}</strong><small>{event.place?.name || event.kind || event.note || "历史现场"}</small></span></button>)}
          </div>
          {mapData && mapData.events.length > 10 ? <button type="button" className="event-more" onClick={() => setExpanded(value => !value)}>{expanded ? "收起事件" : `查看全部 ${mapData.events.length} 条事件`} <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m7 10 5 5 5-5" /></svg></button> : null}
        </>}
      </aside>
    </div>

    <p className="map-footnote">{mapData?.boundary.meta?.source || "疆域资料沿用原项目"}。{mapData?.boundary.meta?.note || "疆域为示意轮廓，非精确行政边界。"} <Link href="/about/">查看数据说明</Link></p>
  </section>;
}
