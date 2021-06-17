/** @jsx h */
import {
  autocomplete,
  AutocompleteComponents,
  getAlgoliaResults
} from "@algolia/autocomplete-js";
import { createQuerySuggestionsPlugin } from "@algolia/autocomplete-plugin-query-suggestions";
import algoliasearch from "algoliasearch";
import { h, Fragment, render } from "preact";

import "@algolia/autocomplete-theme-classic";

import { ProductHit } from "./types";

const appId = "latency";
const apiKey = "6be0576ff61c053d5f9a3225e2a90f76";
const searchClient = algoliasearch(appId, apiKey);

const querySuggestionsPlugin = createQuerySuggestionsPlugin({
  searchClient,
  indexName: "instant_search_demo_query_suggestions",
  getSearchParams() {
    return {
      hitsPerPage: 10
    };
  }
});

function createProductsPlugin({ searchClient }) {
  return {
    getSources({ query }) {
      return [
        {
          sourceId: "productsPlugin",
          getItems() {
            return getAlgoliaResults<ProductHit>({
              searchClient,
              queries: [
                {
                  indexName: "instant_search",
                  query,
                  params: {
                    attributesToSnippet: ["name:10"],
                    snippetEllipsisText: "…"
                  }
                }
              ]
            });
          },
          templates: {
            header() {
              return (
                <Fragment>
                  <span className="aa-SourceHeaderTitle">Products</span>
                  <div className="aa-SourceHeaderLine" />
                </Fragment>
              );
            },
            item({ item, components }) {
              return <ProductItem hit={item} components={components} />;
            },
            noResults() {
              return "No products for this query.";
            }
          }
        }
      ];
    }
  };
}

const productsPlugin = createProductsPlugin({
  searchClient
});

autocomplete<ProductHit>({
  container: "#autocomplete",
  placeholder: "Search",
  openOnFocus: true,
  plugins: [querySuggestionsPlugin, productsPlugin],
  render({ elements }, root) {
    const { productsPlugin, querySuggestionsPlugin } = elements;

    render(
      <Fragment>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
          <div className="aa-PanelLayout aa-Panel--scrollable">
            {productsPlugin}
          </div>
          <div className="aa-PanelLayout aa-Panel--scrollable">
            {querySuggestionsPlugin}
          </div>
        </div>
        <div className="aa-GradientBottom" />
      </Fragment>,
      root
    );
  }
});

type ProductItemProps = {
  hit: ProductHit;
  components: AutocompleteComponents;
};

function ProductItem({ hit, components }: ProductItemProps) {
  return (
    <a href={hit.url} className="aa-ItemLink">
      <div className="aa-ItemContent">
        <div className="aa-ItemIcon aa-ItemIcon--picture aa-ItemIcon--alignTop">
          <img src={hit.image} alt={hit.name} width="40" height="40" />
        </div>
        <div className="aa-ItemContentBody">
          <div className="aa-ItemContentTitle">
            <components.Snippet hit={hit} attribute="name" />
          </div>
          <div className="aa-ItemContentDescription">
            From <strong>{hit.brand}</strong> in{" "}
            <strong>{hit.categories[0]}</strong>
          </div>
          {hit.rating > 0 && (
            <div className="aa-ItemContentDescription">
              <div style={{ display: "flex", gap: 1, color: "#ffc107" }}>
                {Array.from({ length: 5 }, (_value, index) => {
                  const isFilled = hit.rating >= index + 1;

                  return (
                    <svg
                      key={index}
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill={isFilled ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  );
                })}
              </div>
            </div>
          )}
          <div className="aa-ItemContentDescription" style={{ color: "#000" }}>
            <strong>${hit.price.toLocaleString()}</strong>
          </div>
        </div>
      </div>
      <div className="aa-ItemActions">
        <button
          className="aa-ItemActionButton aa-DesktopOnly aa-ActiveOnly"
          type="button"
          title="Select"
          style={{ pointerEvents: "none" }}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M18.984 6.984h2.016v6h-15.188l3.609 3.609-1.406 1.406-6-6 6-6 1.406 1.406-3.609 3.609h13.172v-4.031z" />
          </svg>
        </button>
      </div>
    </a>
  );
}
