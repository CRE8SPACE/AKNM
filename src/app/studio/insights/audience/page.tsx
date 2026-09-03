import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

import "./audience.css";


/* =========================================================
   TYPES
   ========================================================= */

type AnalyticsEvent = {
  id: string;
  event_type: string;
  path: string;
  page_title: string | null;
  referrer: string | null;
  visitor_id: string | null;
  session_id: string | null;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  country: string | null;
  city: string | null;
  created_at: string;
};


type PageStat = {
  path: string;
  title: string;
  views: number;
};


type BreakdownItem = {
  label: string;
  count: number;
  percentage: number;
};


/* =========================================================
   HELPERS
   ========================================================= */

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}


function formatDate(date: string) {
  return new Date(date).toLocaleDateString(
    "en-US",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  );
}


function formatRelativeDate(date: string) {
  const now = new Date();

  const target = new Date(date);

  const difference =
    now.getTime() -
    target.getTime();

  const minutes =
    Math.floor(
      difference / 60000,
    );

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours =
    Math.floor(
      minutes / 60,
    );

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days =
    Math.floor(
      hours / 24,
    );

  if (days < 7) {
    return `${days}d ago`;
  }

  return formatDate(date);
}


function formatPath(path: string) {
  if (path === "/") {
    return "Homepage";
  }

  return path;
}


function formatReferrer(referrer: string | null) {
  if (!referrer) {
    return "Direct";
  }

  try {
    const url = new URL(referrer);

    return url.hostname
      .replace(/^www\./, "");
  } catch {
    return referrer;
  }
}


function getBreakdown(
  values: Array<string | null>,
): BreakdownItem[] {
  const counts =
    new Map<string, number>();

  values.forEach((value) => {
    const label =
      value ||
      "Unknown";

    counts.set(
      label,
      (counts.get(label) || 0) + 1,
    );
  });

  const total =
    values.length;

  return Array.from(
    counts.entries(),
  )
    .map(
      ([label, count]) => ({
        label,
        count,
        percentage:
          total > 0
            ? Math.round(
                (count / total) * 100,
              )
            : 0,
      }),
    )
    .sort(
      (a, b) =>
        b.count -
        a.count,
    );
}


/* =========================================================
   PAGE
   ========================================================= */

export default async function AudiencePage() {
  const supabase =
    await createClient();


  /* =======================================================
     DATE RANGE
     ======================================================= */

  const now =
    new Date();

  const sevenDaysAgo =
    new Date();

  sevenDaysAgo.setDate(
    now.getDate() - 6,
  );

  /*
   * We use the last seven calendar days,
   * including today.
   */

  const startDate =
    new Date(
      sevenDaysAgo,
    );

  startDate.setHours(
    0,
    0,
    0,
    0,
  );


  /* =======================================================
     ANALYTICS QUERY
     ======================================================= */

  const {
    data,
    error,
  } = await supabase
    .from("analytics_events")
    .select(`
      id,
      event_type,
      path,
      page_title,
      referrer,
      visitor_id,
      session_id,
      device_type,
      browser,
      os,
      country,
      city,
      created_at
    `)
    .eq(
      "event_type",
      "page_view",
    )
    .gte(
      "created_at",
      startDate.toISOString(),
    )
    .order(
      "created_at",
      {
        ascending: false,
      },
    )
    .limit(5000);


  /* =======================================================
     ERROR
     ======================================================= */

  if (error) {
    console.error(
      "Audience analytics error:",
      error,
    );
  }


  const events =
    (data ?? []) as AnalyticsEvent[];


  /* =======================================================
     PRIMARY METRICS
     ======================================================= */

  const pageViews =
    events.length;


  const uniqueVisitors =
    new Set(
      events
        .map(
          (event) =>
            event.visitor_id,
        )
        .filter(Boolean),
    ).size;


  const sessions =
    new Set(
      events
        .map(
          (event) =>
            event.session_id,
        )
        .filter(Boolean),
    ).size;


  /* =======================================================
     TOP PAGES
     ======================================================= */

  const pageMap =
    new Map<
      string,
      PageStat
    >();


  events.forEach(
    (event) => {
      const existing =
        pageMap.get(
          event.path,
        );

      if (existing) {
        existing.views += 1;

        return;
      }

      pageMap.set(
        event.path,
        {
          path:
            event.path,

          title:
            event.page_title ||
            formatPath(
              event.path,
            ),

          views: 1,
        },
      );
    },
  );


  const topPages =
    Array.from(
      pageMap.values(),
    )
      .sort(
        (a, b) =>
          b.views -
          a.views,
      )
      .slice(
        0,
        8,
      );


  /* =======================================================
     DEVICE BREAKDOWN
     ======================================================= */

  const devices =
    getBreakdown(
      events.map(
        (event) =>
          event.device_type,
      ),
    );


  /* =======================================================
     BROWSER BREAKDOWN
     ======================================================= */

  const browsers =
    getBreakdown(
      events.map(
        (event) =>
          event.browser,
      ),
    );


  /* =======================================================
     OS BREAKDOWN
     ======================================================= */

  const operatingSystems =
    getBreakdown(
      events.map(
        (event) =>
          event.os,
      ),
    );


  /* =======================================================
     TRAFFIC SOURCES
     ======================================================= */

  const trafficSources =
    getBreakdown(
      events.map(
        (event) =>
          formatReferrer(
            event.referrer,
          ),
      ),
    );


  /* =======================================================
     DAILY TRAFFIC
     ======================================================= */

  const dailyMap =
    new Map<
      string,
      number
    >();


  for (
    let index = 0;
    index < 7;
    index++
  ) {
    const date =
      new Date();

    date.setDate(
      now.getDate() -
        (6 - index),
    );

    date.setHours(
      0,
      0,
      0,
      0,
    );

    const key =
      date
        .toISOString()
        .slice(
          0,
          10,
        );

    dailyMap.set(
      key,
      0,
    );
  }


  events.forEach(
    (event) => {
      const key =
        new Date(
          event.created_at,
        )
          .toISOString()
          .slice(
            0,
            10,
          );

      if (
        dailyMap.has(key)
      ) {
        dailyMap.set(
          key,
          (dailyMap.get(
            key,
          ) || 0) + 1,
        );
      }
    },
  );


  const dailyTraffic =
    Array.from(
      dailyMap.entries(),
    ).map(
      ([date, views]) => ({
        date,
        views,
        label:
          new Date(
            `${date}T00:00:00`,
          ).toLocaleDateString(
            "en-US",
            {
              weekday: "short",
            },
          ),
      }),
    );


  const maximumDailyViews =
    Math.max(
      ...dailyTraffic.map(
        (item) =>
          item.views,
      ),
      1,
    );


  /* =======================================================
     RECENT ACTIVITY
     ======================================================= */

  const recentEvents =
    events.slice(
      0,
      12,
    );


  /* =======================================================
     RANGE LABEL
     ======================================================= */

  const rangeLabel =
    `${startDate.toLocaleDateString(
      "en-US",
      {
        day: "2-digit",
        month: "short",
      },
    )} — ${now.toLocaleDateString(
      "en-US",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      },
    )}`;


  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <main className="audience-page">

      {/* =================================================
          HEADER
          ================================================= */}

      <header className="audience-header">

        <div className="audience-header__copy">

          <span className="audience-header__eyebrow">
            INSIGHTS / AUDIENCE
          </span>

          <h1>
            Know who is
            <br />
            visiting your world.
          </h1>

          <p>
            Understand how people discover,
            navigate and experience your
            website.
          </p>

        </div>


        <div className="audience-header__meta">

          <span className="audience-header__status">
            <span />
            ANALYTICS ACTIVE
          </span>

          <span className="audience-header__range">
            LAST 7 DAYS
          </span>

          <strong>
            {rangeLabel}
          </strong>

        </div>

      </header>


      {/* =================================================
          ERROR STATE
          ================================================= */}

      {error && (
        <section className="audience-alert">

          <strong>
            Analytics data could not
            be loaded.
          </strong>

          <span>
            Check your Supabase connection
            and analytics_events table.
          </span>

        </section>
      )}


      {/* =================================================
          PRIMARY METRICS
          ================================================= */}

      <section
        className="audience-metrics"
        aria-label="Audience metrics"
      >

        <article className="audience-metric">

          <span>
            PAGE VIEWS
          </span>

          <strong>
            {formatNumber(
              pageViews,
            )}
          </strong>

          <small>
            Total page visits
          </small>

        </article>


        <article className="audience-metric">

          <span>
            UNIQUE VISITORS
          </span>

          <strong>
            {formatNumber(
              uniqueVisitors,
            )}
          </strong>

          <small>
            Distinct visitors
          </small>

        </article>


        <article className="audience-metric">

          <span>
            SESSIONS
          </span>

          <strong>
            {formatNumber(
              sessions,
            )}
          </strong>

          <small>
            Visitor sessions
          </small>

        </article>


        <article className="audience-metric">

          <span>
            PAGES / SESSION
          </span>

          <strong>
            {sessions > 0
              ? (
                  pageViews /
                  sessions
                ).toFixed(1)
              : "0.0"}
          </strong>

          <small>
            Average navigation depth
          </small>

        </article>

      </section>


      {/* =================================================
          TRAFFIC OVERVIEW
          ================================================= */}

      <section className="audience-section">

        <div className="audience-section__header">

          <div>

            <span>
              TRAFFIC
            </span>

            <h2>
              Visitor activity
            </h2>

          </div>

          <span className="audience-section__period">
            7 DAYS
          </span>

        </div>


        <div className="audience-chart">

          <div className="audience-chart__values">

            {dailyTraffic.map(
              (item) => (
                <span
                  key={item.date}
                >
                  {item.views}
                </span>
              ),
            )}

          </div>


          <div className="audience-chart__bars">

            {dailyTraffic.map(
              (item) => {
                const height =
                  Math.max(
                    (item.views /
                      maximumDailyViews) *
                      100,
                    item.views > 0
                      ? 8
                      : 2,
                  );

                return (
                  <div
                    key={item.date}
                    className="audience-chart__column"
                  >

                    <div className="audience-chart__bar-track">

                      <div
                        className="audience-chart__bar"
                        style={{
                          height: `${height}%`,
                        }}
                      />

                    </div>

                    <span>
                      {item.label}
                    </span>

                  </div>
                );
              },
            )}

          </div>

        </div>

      </section>


      {/* =================================================
          MAIN ANALYTICS GRID
          ================================================= */}

      <section className="audience-grid">

        {/* =================================================
            TOP PAGES
            ================================================= */}

        <article className="audience-panel audience-panel--pages">

          <div className="audience-panel__header">

            <div>

              <span>
                CONTENT
              </span>

              <h2>
                Top pages
              </h2>

            </div>

            <Link href="/studio/insights/content">
              Content analytics ↗
            </Link>

          </div>


          {topPages.length === 0 ? (

            <div className="audience-empty">
              No page views recorded yet.
            </div>

          ) : (

            <div className="audience-pages">

              {topPages.map(
                (page, index) => (
                  <div
                    key={page.path}
                    className="audience-page-row"
                  >

                    <span className="audience-page-row__number">
                      {String(
                        index + 1,
                      ).padStart(
                        2,
                        "0",
                      )}
                    </span>


                    <div className="audience-page-row__main">

                      <strong>
                        {page.title}
                      </strong>

                      <span>
                        {page.path}
                      </span>

                    </div>


                    <strong className="audience-page-row__views">
                      {formatNumber(
                        page.views,
                      )}
                    </strong>

                  </div>
                ),
              )}

            </div>

          )}

        </article>


        {/* =================================================
            DEVICES
            ================================================= */}

        <article className="audience-panel">

          <div className="audience-panel__header">

            <div>

              <span>
                TECHNOLOGY
              </span>

              <h2>
                Devices
              </h2>

            </div>

          </div>


          {devices.length === 0 ? (

            <div className="audience-empty">
              No device data yet.
            </div>

          ) : (

            <div className="audience-breakdown">

              {devices
                .slice(
                  0,
                  5,
                )
                .map(
                  (item) => (
                    <div
                      key={item.label}
                      className="audience-breakdown__item"
                    >

                      <div>

                        <span>
                          {item.label}
                        </span>

                        <strong>
                          {item.percentage}%
                        </strong>

                      </div>

                      <div className="audience-breakdown__track">

                        <div
                          style={{
                            width: `${item.percentage}%`,
                          }}
                        />

                      </div>

                      <small>
                        {formatNumber(
                          item.count,
                        )}{" "}
                        views
                      </small>

                    </div>
                  ),
                )}

            </div>

          )}

        </article>


        {/* =================================================
            TRAFFIC SOURCES
            ================================================= */}

        <article className="audience-panel">

          <div className="audience-panel__header">

            <div>

              <span>
                DISCOVERY
              </span>

              <h2>
                Traffic sources
              </h2>

            </div>

          </div>


          {trafficSources.length === 0 ? (

            <div className="audience-empty">
              No traffic source data yet.
            </div>

          ) : (

            <div className="audience-source-list">

              {trafficSources
                .slice(
                  0,
                  6,
                )
                .map(
                  (item) => (
                    <div
                      key={item.label}
                      className="audience-source"
                    >

                      <span>
                        {item.label}
                      </span>

                      <strong>
                        {formatNumber(
                          item.count,
                        )}
                      </strong>

                      <small>
                        {item.percentage}%
                      </small>

                    </div>
                  ),
                )}

            </div>

          )}

        </article>


        {/* =================================================
            BROWSERS / OS
            ================================================= */}

        <article className="audience-panel">

          <div className="audience-panel__header">

            <div>

              <span>
                TECHNOLOGY
              </span>

              <h2>
                Browsers
              </h2>

            </div>

          </div>


          {browsers.length === 0 ? (

            <div className="audience-empty">
              No browser data yet.
            </div>

          ) : (

            <div className="audience-simple-list">

              {browsers
                .slice(
                  0,
                  6,
                )
                .map(
                  (item) => (
                    <div
                      key={item.label}
                    >

                      <span>
                        {item.label}
                      </span>

                      <strong>
                        {item.percentage}%
                      </strong>

                    </div>
                  ),
                )}

            </div>

          )}

        </article>

      </section>


      {/* =================================================
          OPERATING SYSTEMS
          ================================================= */}

      <section className="audience-section audience-section--compact">

        <div className="audience-section__header">

          <div>

            <span>
              PLATFORM
            </span>

            <h2>
              Operating systems
            </h2>

          </div>

        </div>


        <div className="audience-os-grid">

          {operatingSystems
            .slice(
              0,
              6,
            )
            .map(
              (item) => (
                <div
                  key={item.label}
                  className="audience-os"
                >

                  <span>
                    {item.label}
                  </span>

                  <strong>
                    {item.percentage}%
                  </strong>

                  <small>
                    {formatNumber(
                      item.count,
                    )}{" "}
                    views
                  </small>

                </div>
              ),
            )}

          {operatingSystems.length === 0 && (
            <div className="audience-empty">
              No operating system data yet.
            </div>
          )}

        </div>

      </section>


      {/* =================================================
          RECENT ACTIVITY
          ================================================= */}

      <section className="audience-section">

        <div className="audience-section__header">

          <div>

            <span>
              LIVE ACTIVITY
            </span>

            <h2>
              Recent visitors
            </h2>

          </div>

          <span className="audience-section__period">
            LATEST 12
          </span>

        </div>


        {recentEvents.length === 0 ? (

          <div className="audience-recent-empty">

            <div>
              +
            </div>

            <strong>
              Waiting for your first visitor.
            </strong>

            <p>
              Once someone visits the public
              website, their page-view activity
              will appear here.
            </p>

          </div>

        ) : (

          <div className="audience-recent">

            {recentEvents.map(
              (event) => (
                <div
                  key={event.id}
                  className="audience-recent__row"
                >

                  <div className="audience-recent__indicator">
                    <span />
                  </div>


                  <div className="audience-recent__page">

                    <strong>
                      {formatPath(
                        event.path,
                      )}
                    </strong>

                    <span>
                      {event.page_title ||
                        "Page view"}
                    </span>

                  </div>


                  <div className="audience-recent__visitor">

                    <span>
                      {event.device_type ||
                        "Unknown device"}
                    </span>

                    <small>
                      {event.browser ||
                        "Unknown browser"}
                    </small>

                  </div>


                  <div className="audience-recent__location">

                    <span>
                      {event.country ||
                        "Unknown location"}
                    </span>

                    {event.city && (
                      <small>
                        {event.city}
                      </small>
                    )}

                  </div>


                  <time>
                    {formatRelativeDate(
                      event.created_at,
                    )}
                  </time>

                </div>
              ),
            )}

          </div>

        )}

      </section>


      {/* =================================================
          FOOTER
          ================================================= */}

      <footer className="audience-footer">

        <div>

          <span>
            AKNM ANALYTICS
          </span>

          <strong>
            {formatNumber(
              pageViews,
            )}
          </strong>

          <p>
            Page views recorded
            over the selected period.
          </p>

        </div>


        <div>

          <span>
            DATA SYSTEM
          </span>

          <strong>
            CONNECTED
          </strong>

          <p>
            Powered by the AKNM analytics
            event system.
          </p>

        </div>


        <Link href="/studio/insights">
          ← Back to Insights
        </Link>

      </footer>

    </main>
  );
}