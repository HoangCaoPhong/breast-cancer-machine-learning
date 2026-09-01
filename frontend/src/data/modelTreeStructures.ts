import { TreeNodeData, ModelOptionId } from '../types/prediction';

/**
 * Distinct hierarchical decision tree structures for each model variant
 * fitted on the canonical 80/20 training split (455 samples: 285 Benign, 170 Malignant).
 */
export const MODEL_TREE_STRUCTURES: Record<ModelOptionId, TreeNodeData> = {
  "B0": {
    "id": "root_B0",
    "name": "Chu vi xấu nhất (perimeter_worst) ≤ 112.80",
    "feature": "perimeter_worst",
    "threshold": 112.8,
    "criterion": "gini = 0.468",
    "samples": 455,
    "values": [
      285,
      170
    ],
    "isLeaf": false,
    "children": [
      {
        "id": "root_B0_L",
        "name": "Điểm lõm xấu nhất (concave_points_worst) ≤ 0.16",
        "feature": "concave_points_worst",
        "threshold": 0.1603,
        "criterion": "gini = 0.137",
        "samples": 297,
        "values": [
          275,
          22
        ],
        "isLeaf": false,
        "children": [
          {
            "id": "root_B0_L_L",
            "name": "Diện tích trung bình (area_mean) ≤ 696.25",
            "feature": "area_mean",
            "threshold": 696.25,
            "criterion": "gini = 0.081",
            "samples": 285,
            "values": [
              273,
              12
            ],
            "isLeaf": false,
            "children": [
              {
                "id": "root_B0_L_L_L",
                "name": "Độ mịn xấu nhất (smoothness_worst) ≤ 0.18",
                "feature": "smoothness_worst",
                "threshold": 0.1782,
                "criterion": "gini = 0.056",
                "samples": 279,
                "values": [
                  271,
                  8
                ],
                "isLeaf": false,
                "children": [
                  {
                    "id": "root_B0_L_L_L_L",
                    "name": "Chu vi xấu nhất (perimeter_worst) ≤ 102.40",
                    "feature": "perimeter_worst",
                    "threshold": 102.4,
                    "criterion": "gini = 0.036",
                    "samples": 274,
                    "values": [
                      269,
                      5
                    ],
                    "isLeaf": false,
                    "children": [
                      {
                        "id": "root_B0_L_L_L_L_L",
                        "name": "Sai số diện tích (area_se) ≤ 47.03",
                        "feature": "area_se",
                        "threshold": 47.035,
                        "criterion": "gini = 0.016",
                        "samples": 247,
                        "values": [
                          245,
                          2
                        ],
                        "isLeaf": false,
                        "children": [
                          {
                            "id": "root_B0_L_L_L_L_L_L",
                            "name": "Độ nhám xấu nhất (texture_worst) ≤ 33.35",
                            "feature": "texture_worst",
                            "threshold": 33.35,
                            "criterion": "gini = 0.008",
                            "samples": 243,
                            "values": [
                              242,
                              1
                            ],
                            "isLeaf": false,
                            "children": [
                              {
                                "id": "root_B0_L_L_L_L_L_L_L",
                                "name": "Lá: Lành tính",
                                "samples": 229,
                                "values": [
                                  229,
                                  0
                                ],
                                "criterion": "gini = 0.000",
                                "isLeaf": true,
                                "predictedClass": "Benign",
                                "children": []
                              },
                              {
                                "id": "root_B0_L_L_L_L_L_L_R",
                                "name": "Độ nhám trung bình (texture_mean) ≤ 23.20",
                                "feature": "texture_mean",
                                "threshold": 23.2,
                                "criterion": "gini = 0.133",
                                "samples": 14,
                                "values": [
                                  13,
                                  1
                                ],
                                "isLeaf": false,
                                "children": [
                                  {
                                    "id": "root_B0_L_L_L_L_L_L_R_L",
                                    "name": "Lá: Ác tính",
                                    "samples": 1,
                                    "values": [
                                      0,
                                      1
                                    ],
                                    "criterion": "gini = 0.000",
                                    "isLeaf": true,
                                    "predictedClass": "Malignant",
                                    "children": []
                                  },
                                  {
                                    "id": "root_B0_L_L_L_L_L_L_R_R",
                                    "name": "Lá: Lành tính",
                                    "samples": 13,
                                    "values": [
                                      13,
                                      0
                                    ],
                                    "criterion": "gini = 0.000",
                                    "isLeaf": true,
                                    "predictedClass": "Benign",
                                    "children": []
                                  }
                                ]
                              }
                            ]
                          },
                          {
                            "id": "root_B0_L_L_L_L_L_R",
                            "name": "Độ nén trung bình (compactness_mean) ≤ 0.06",
                            "feature": "compactness_mean",
                            "threshold": 0.0626,
                            "criterion": "gini = 0.375",
                            "samples": 4,
                            "values": [
                              3,
                              1
                            ],
                            "isLeaf": false,
                            "children": [
                              {
                                "id": "root_B0_L_L_L_L_L_R_L",
                                "name": "Lá: Ác tính",
                                "samples": 1,
                                "values": [
                                  0,
                                  1
                                ],
                                "criterion": "gini = 0.000",
                                "isLeaf": true,
                                "predictedClass": "Malignant",
                                "children": []
                              },
                              {
                                "id": "root_B0_L_L_L_L_L_R_R",
                                "name": "Lá: Lành tính",
                                "samples": 3,
                                "values": [
                                  3,
                                  0
                                ],
                                "criterion": "gini = 0.000",
                                "isLeaf": true,
                                "predictedClass": "Benign",
                                "children": []
                              }
                            ]
                          }
                        ]
                      },
                      {
                        "id": "root_B0_L_L_L_L_R",
                        "name": "Độ mịn xấu nhất (smoothness_worst) ≤ 0.14",
                        "feature": "smoothness_worst",
                        "threshold": 0.1363,
                        "criterion": "gini = 0.198",
                        "samples": 27,
                        "values": [
                          24,
                          3
                        ],
                        "isLeaf": false,
                        "children": [
                          {
                            "id": "root_B0_L_L_L_L_R_L",
                            "name": "Sai số chu vi (perimeter_se) ≤ 1.58",
                            "feature": "perimeter_se",
                            "threshold": 1.584,
                            "criterion": "gini = 0.077",
                            "samples": 25,
                            "values": [
                              24,
                              1
                            ],
                            "isLeaf": false,
                            "children": [
                              {
                                "id": "root_B0_L_L_L_L_R_L_L",
                                "name": "Bán kính trung bình (radius_mean) ≤ 14.04",
                                "feature": "radius_mean",
                                "threshold": 14.04,
                                "criterion": "gini = 0.500",
                                "samples": 2,
                                "values": [
                                  1,
                                  1
                                ],
                                "isLeaf": false,
                                "children": [
                                  {
                                    "id": "root_B0_L_L_L_L_R_L_L_L",
                                    "name": "Lá: Ác tính",
                                    "samples": 1,
                                    "values": [
                                      0,
                                      1
                                    ],
                                    "criterion": "gini = 0.000",
                                    "isLeaf": true,
                                    "predictedClass": "Malignant",
                                    "children": []
                                  },
                                  {
                                    "id": "root_B0_L_L_L_L_R_L_L_R",
                                    "name": "Lá: Lành tính",
                                    "samples": 1,
                                    "values": [
                                      1,
                                      0
                                    ],
                                    "criterion": "gini = 0.000",
                                    "isLeaf": true,
                                    "predictedClass": "Benign",
                                    "children": []
                                  }
                                ]
                              },
                              {
                                "id": "root_B0_L_L_L_L_R_L_R",
                                "name": "Lá: Lành tính",
                                "samples": 23,
                                "values": [
                                  23,
                                  0
                                ],
                                "criterion": "gini = 0.000",
                                "isLeaf": true,
                                "predictedClass": "Benign",
                                "children": []
                              }
                            ]
                          },
                          {
                            "id": "root_B0_L_L_L_L_R_R",
                            "name": "Lá: Ác tính",
                            "samples": 2,
                            "values": [
                              0,
                              2
                            ],
                            "criterion": "gini = 0.000",
                            "isLeaf": true,
                            "predictedClass": "Malignant",
                            "children": []
                          }
                        ]
                      }
                    ]
                  },
                  {
                    "id": "root_B0_L_L_L_R",
                    "name": "Bán kính trung bình (radius_mean) ≤ 10.12",
                    "feature": "radius_mean",
                    "threshold": 10.1225,
                    "criterion": "gini = 0.480",
                    "samples": 5,
                    "values": [
                      2,
                      3
                    ],
                    "isLeaf": false,
                    "children": [
                      {
                        "id": "root_B0_L_L_L_R_L",
                        "name": "Lá: Lành tính",
                        "samples": 2,
                        "values": [
                          2,
                          0
                        ],
                        "criterion": "gini = 0.000",
                        "isLeaf": true,
                        "predictedClass": "Benign",
                        "children": []
                      },
                      {
                        "id": "root_B0_L_L_L_R_R",
                        "name": "Lá: Ác tính",
                        "samples": 3,
                        "values": [
                          0,
                          3
                        ],
                        "criterion": "gini = 0.000",
                        "isLeaf": true,
                        "predictedClass": "Malignant",
                        "children": []
                      }
                    ]
                  }
                ]
              },
              {
                "id": "root_B0_L_L_R",
                "name": "Độ nhám trung bình (texture_mean) ≤ 19.23",
                "feature": "texture_mean",
                "threshold": 19.23,
                "criterion": "gini = 0.444",
                "samples": 6,
                "values": [
                  2,
                  4
                ],
                "isLeaf": false,
                "children": [
                  {
                    "id": "root_B0_L_L_R_L",
                    "name": "Lá: Lành tính",
                    "samples": 2,
                    "values": [
                      2,
                      0
                    ],
                    "criterion": "gini = 0.000",
                    "isLeaf": true,
                    "predictedClass": "Benign",
                    "children": []
                  },
                  {
                    "id": "root_B0_L_L_R_R",
                    "name": "Lá: Ác tính",
                    "samples": 4,
                    "values": [
                      0,
                      4
                    ],
                    "criterion": "gini = 0.000",
                    "isLeaf": true,
                    "predictedClass": "Malignant",
                    "children": []
                  }
                ]
              }
            ]
          },
          {
            "id": "root_B0_L_R",
            "name": "Độ nhám xấu nhất (texture_worst) ≤ 24.79",
            "feature": "texture_worst",
            "threshold": 24.785,
            "criterion": "gini = 0.278",
            "samples": 12,
            "values": [
              2,
              10
            ],
            "isLeaf": false,
            "children": [
              {
                "id": "root_B0_L_R_L",
                "name": "Độ nhám trung bình (texture_mean) ≤ 15.71",
                "feature": "texture_mean",
                "threshold": 15.71,
                "criterion": "gini = 0.444",
                "samples": 3,
                "values": [
                  2,
                  1
                ],
                "isLeaf": false,
                "children": [
                  {
                    "id": "root_B0_L_R_L_L",
                    "name": "Lá: Ác tính",
                    "samples": 1,
                    "values": [
                      0,
                      1
                    ],
                    "criterion": "gini = 0.000",
                    "isLeaf": true,
                    "predictedClass": "Malignant",
                    "children": []
                  },
                  {
                    "id": "root_B0_L_R_L_R",
                    "name": "Lá: Lành tính",
                    "samples": 2,
                    "values": [
                      2,
                      0
                    ],
                    "criterion": "gini = 0.000",
                    "isLeaf": true,
                    "predictedClass": "Benign",
                    "children": []
                  }
                ]
              },
              {
                "id": "root_B0_L_R_R",
                "name": "Lá: Ác tính",
                "samples": 9,
                "values": [
                  0,
                  9
                ],
                "criterion": "gini = 0.000",
                "isLeaf": true,
                "predictedClass": "Malignant",
                "children": []
              }
            ]
          }
        ]
      },
      {
        "id": "root_B0_R",
        "name": "Độ nhám trung bình (texture_mean) ≤ 14.96",
        "feature": "texture_mean",
        "threshold": 14.955,
        "criterion": "gini = 0.119",
        "samples": 158,
        "values": [
          10,
          148
        ],
        "isLeaf": false,
        "children": [
          {
            "id": "root_B0_R_L",
            "name": "Độ nhám trung bình (texture_mean) ≤ 12.40",
            "feature": "texture_mean",
            "threshold": 12.4,
            "criterion": "gini = 0.408",
            "samples": 7,
            "values": [
              5,
              2
            ],
            "isLeaf": false,
            "children": [
              {
                "id": "root_B0_R_L_L",
                "name": "Lá: Ác tính",
                "samples": 2,
                "values": [
                  0,
                  2
                ],
                "criterion": "gini = 0.000",
                "isLeaf": true,
                "predictedClass": "Malignant",
                "children": []
              },
              {
                "id": "root_B0_R_L_R",
                "name": "Lá: Lành tính",
                "samples": 5,
                "values": [
                  5,
                  0
                ],
                "criterion": "gini = 0.000",
                "isLeaf": true,
                "predictedClass": "Benign",
                "children": []
              }
            ]
          },
          {
            "id": "root_B0_R_R",
            "name": "Diện tích xấu nhất (area_worst) ≤ 810.10",
            "feature": "area_worst",
            "threshold": 810.1,
            "criterion": "gini = 0.064",
            "samples": 151,
            "values": [
              5,
              146
            ],
            "isLeaf": false,
            "children": [
              {
                "id": "root_B0_R_R_L",
                "name": "Độ mịn trung bình (smoothness_mean) ≤ 0.09",
                "feature": "smoothness_mean",
                "threshold": 0.0933,
                "criterion": "gini = 0.480",
                "samples": 5,
                "values": [
                  3,
                  2
                ],
                "isLeaf": false,
                "children": [
                  {
                    "id": "root_B0_R_R_L_L",
                    "name": "Lá: Lành tính",
                    "samples": 3,
                    "values": [
                      3,
                      0
                    ],
                    "criterion": "gini = 0.000",
                    "isLeaf": true,
                    "predictedClass": "Benign",
                    "children": []
                  },
                  {
                    "id": "root_B0_R_R_L_R",
                    "name": "Lá: Ác tính",
                    "samples": 2,
                    "values": [
                      0,
                      2
                    ],
                    "criterion": "gini = 0.000",
                    "isLeaf": true,
                    "predictedClass": "Malignant",
                    "children": []
                  }
                ]
              },
              {
                "id": "root_B0_R_R_R",
                "name": "Độ mịn xấu nhất (smoothness_worst) ≤ 0.09",
                "feature": "smoothness_worst",
                "threshold": 0.088,
                "criterion": "gini = 0.027",
                "samples": 146,
                "values": [
                  2,
                  144
                ],
                "isLeaf": false,
                "children": [
                  {
                    "id": "root_B0_R_R_R_L",
                    "name": "Lá: Lành tính",
                    "samples": 1,
                    "values": [
                      1,
                      0
                    ],
                    "criterion": "gini = 0.000",
                    "isLeaf": true,
                    "predictedClass": "Benign",
                    "children": []
                  },
                  {
                    "id": "root_B0_R_R_R_R",
                    "name": "Độ lõm xấu nhất (concavity_worst) ≤ 0.19",
                    "feature": "concavity_worst",
                    "threshold": 0.1871,
                    "criterion": "gini = 0.014",
                    "samples": 145,
                    "values": [
                      1,
                      144
                    ],
                    "isLeaf": false,
                    "children": [
                      {
                        "id": "root_B0_R_R_R_R_L",
                        "name": "Độ nhám trung bình (texture_mean) ≤ 20.67",
                        "feature": "texture_mean",
                        "threshold": 20.675,
                        "criterion": "gini = 0.444",
                        "samples": 3,
                        "values": [
                          1,
                          2
                        ],
                        "isLeaf": false,
                        "children": [
                          {
                            "id": "root_B0_R_R_R_R_L_L",
                            "name": "Lá: Lành tính",
                            "samples": 1,
                            "values": [
                              1,
                              0
                            ],
                            "criterion": "gini = 0.000",
                            "isLeaf": true,
                            "predictedClass": "Benign",
                            "children": []
                          },
                          {
                            "id": "root_B0_R_R_R_R_L_R",
                            "name": "Lá: Ác tính",
                            "samples": 2,
                            "values": [
                              0,
                              2
                            ],
                            "criterion": "gini = 0.000",
                            "isLeaf": true,
                            "predictedClass": "Malignant",
                            "children": []
                          }
                        ]
                      },
                      {
                        "id": "root_B0_R_R_R_R_R",
                        "name": "Lá: Ác tính",
                        "samples": 142,
                        "values": [
                          0,
                          142
                        ],
                        "criterion": "gini = 0.000",
                        "isLeaf": true,
                        "predictedClass": "Malignant",
                        "children": []
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  "C0": {
    "id": "root_C0",
    "name": "Chu vi xấu nhất (perimeter_worst) ≤ 112.80",
    "feature": "perimeter_worst",
    "threshold": 112.8,
    "criterion": "gini = 0.468",
    "samples": 455,
    "values": [
      285,
      170
    ],
    "isLeaf": false,
    "children": [
      {
        "id": "root_C0_L",
        "name": "Điểm lõm xấu nhất (concave_points_worst) ≤ 0.16",
        "feature": "concave_points_worst",
        "threshold": 0.1603,
        "criterion": "gini = 0.137",
        "samples": 297,
        "values": [
          275,
          22
        ],
        "isLeaf": false,
        "children": [
          {
            "id": "root_C0_L_L",
            "name": "Diện tích trung bình (area_mean) ≤ 696.25",
            "feature": "area_mean",
            "threshold": 696.25,
            "criterion": "gini = 0.081",
            "samples": 285,
            "values": [
              273,
              12
            ],
            "isLeaf": false,
            "children": [
              {
                "id": "root_C0_L_L_L",
                "name": "Độ mịn xấu nhất (smoothness_worst) ≤ 0.18",
                "feature": "smoothness_worst",
                "threshold": 0.1782,
                "criterion": "gini = 0.056",
                "samples": 279,
                "values": [
                  271,
                  8
                ],
                "isLeaf": false,
                "children": [
                  {
                    "id": "root_C0_L_L_L_L",
                    "name": "Chu vi xấu nhất (perimeter_worst) ≤ 102.40",
                    "feature": "perimeter_worst",
                    "threshold": 102.4,
                    "criterion": "gini = 0.036",
                    "samples": 274,
                    "values": [
                      269,
                      5
                    ],
                    "isLeaf": false,
                    "children": [
                      {
                        "id": "root_C0_L_L_L_L_L",
                        "name": "Lá: Lành tính",
                        "samples": 247,
                        "values": [
                          245,
                          2
                        ],
                        "criterion": "gini = 0.016",
                        "isLeaf": true,
                        "predictedClass": "Benign",
                        "children": []
                      },
                      {
                        "id": "root_C0_L_L_L_L_R",
                        "name": "Lá: Lành tính",
                        "samples": 27,
                        "values": [
                          24,
                          3
                        ],
                        "criterion": "gini = 0.198",
                        "isLeaf": true,
                        "predictedClass": "Benign",
                        "children": []
                      }
                    ]
                  },
                  {
                    "id": "root_C0_L_L_L_R",
                    "name": "Bán kính trung bình (radius_mean) ≤ 10.12",
                    "feature": "radius_mean",
                    "threshold": 10.1225,
                    "criterion": "gini = 0.480",
                    "samples": 5,
                    "values": [
                      2,
                      3
                    ],
                    "isLeaf": false,
                    "children": [
                      {
                        "id": "root_C0_L_L_L_R_L",
                        "name": "Lá: Lành tính",
                        "samples": 2,
                        "values": [
                          2,
                          0
                        ],
                        "criterion": "gini = 0.000",
                        "isLeaf": true,
                        "predictedClass": "Benign",
                        "children": []
                      },
                      {
                        "id": "root_C0_L_L_L_R_R",
                        "name": "Lá: Ác tính",
                        "samples": 3,
                        "values": [
                          0,
                          3
                        ],
                        "criterion": "gini = 0.000",
                        "isLeaf": true,
                        "predictedClass": "Malignant",
                        "children": []
                      }
                    ]
                  }
                ]
              },
              {
                "id": "root_C0_L_L_R",
                "name": "Độ nhám trung bình (texture_mean) ≤ 19.23",
                "feature": "texture_mean",
                "threshold": 19.23,
                "criterion": "gini = 0.444",
                "samples": 6,
                "values": [
                  2,
                  4
                ],
                "isLeaf": false,
                "children": [
                  {
                    "id": "root_C0_L_L_R_L",
                    "name": "Lá: Lành tính",
                    "samples": 2,
                    "values": [
                      2,
                      0
                    ],
                    "criterion": "gini = 0.000",
                    "isLeaf": true,
                    "predictedClass": "Benign",
                    "children": []
                  },
                  {
                    "id": "root_C0_L_L_R_R",
                    "name": "Lá: Ác tính",
                    "samples": 4,
                    "values": [
                      0,
                      4
                    ],
                    "criterion": "gini = 0.000",
                    "isLeaf": true,
                    "predictedClass": "Malignant",
                    "children": []
                  }
                ]
              }
            ]
          },
          {
            "id": "root_C0_L_R",
            "name": "Độ nhám xấu nhất (texture_worst) ≤ 24.79",
            "feature": "texture_worst",
            "threshold": 24.785,
            "criterion": "gini = 0.278",
            "samples": 12,
            "values": [
              2,
              10
            ],
            "isLeaf": false,
            "children": [
              {
                "id": "root_C0_L_R_L",
                "name": "Lá: Lành tính",
                "samples": 3,
                "values": [
                  2,
                  1
                ],
                "criterion": "gini = 0.444",
                "isLeaf": true,
                "predictedClass": "Benign",
                "children": []
              },
              {
                "id": "root_C0_L_R_R",
                "name": "Lá: Ác tính",
                "samples": 9,
                "values": [
                  0,
                  9
                ],
                "criterion": "gini = 0.000",
                "isLeaf": true,
                "predictedClass": "Malignant",
                "children": []
              }
            ]
          }
        ]
      },
      {
        "id": "root_C0_R",
        "name": "Độ nhám trung bình (texture_mean) ≤ 14.96",
        "feature": "texture_mean",
        "threshold": 14.955,
        "criterion": "gini = 0.119",
        "samples": 158,
        "values": [
          10,
          148
        ],
        "isLeaf": false,
        "children": [
          {
            "id": "root_C0_R_L",
            "name": "Độ nhám trung bình (texture_mean) ≤ 12.40",
            "feature": "texture_mean",
            "threshold": 12.4,
            "criterion": "gini = 0.408",
            "samples": 7,
            "values": [
              5,
              2
            ],
            "isLeaf": false,
            "children": [
              {
                "id": "root_C0_R_L_L",
                "name": "Lá: Ác tính",
                "samples": 2,
                "values": [
                  0,
                  2
                ],
                "criterion": "gini = 0.000",
                "isLeaf": true,
                "predictedClass": "Malignant",
                "children": []
              },
              {
                "id": "root_C0_R_L_R",
                "name": "Lá: Lành tính",
                "samples": 5,
                "values": [
                  5,
                  0
                ],
                "criterion": "gini = 0.000",
                "isLeaf": true,
                "predictedClass": "Benign",
                "children": []
              }
            ]
          },
          {
            "id": "root_C0_R_R",
            "name": "Diện tích xấu nhất (area_worst) ≤ 810.10",
            "feature": "area_worst",
            "threshold": 810.1,
            "criterion": "gini = 0.064",
            "samples": 151,
            "values": [
              5,
              146
            ],
            "isLeaf": false,
            "children": [
              {
                "id": "root_C0_R_R_L",
                "name": "Độ mịn trung bình (smoothness_mean) ≤ 0.09",
                "feature": "smoothness_mean",
                "threshold": 0.0933,
                "criterion": "gini = 0.480",
                "samples": 5,
                "values": [
                  3,
                  2
                ],
                "isLeaf": false,
                "children": [
                  {
                    "id": "root_C0_R_R_L_L",
                    "name": "Lá: Lành tính",
                    "samples": 3,
                    "values": [
                      3,
                      0
                    ],
                    "criterion": "gini = 0.000",
                    "isLeaf": true,
                    "predictedClass": "Benign",
                    "children": []
                  },
                  {
                    "id": "root_C0_R_R_L_R",
                    "name": "Lá: Ác tính",
                    "samples": 2,
                    "values": [
                      0,
                      2
                    ],
                    "criterion": "gini = 0.000",
                    "isLeaf": true,
                    "predictedClass": "Malignant",
                    "children": []
                  }
                ]
              },
              {
                "id": "root_C0_R_R_R",
                "name": "Độ lõm xấu nhất (concavity_worst) ≤ 0.20",
                "feature": "concavity_worst",
                "threshold": 0.1981,
                "criterion": "gini = 0.027",
                "samples": 146,
                "values": [
                  2,
                  144
                ],
                "isLeaf": false,
                "children": [
                  {
                    "id": "root_C0_R_R_R_L",
                    "name": "Độ nhám trung bình (texture_mean) ≤ 21.26",
                    "feature": "texture_mean",
                    "threshold": 21.26,
                    "criterion": "gini = 0.500",
                    "samples": 4,
                    "values": [
                      2,
                      2
                    ],
                    "isLeaf": false,
                    "children": [
                      {
                        "id": "root_C0_R_R_R_L_L",
                        "name": "Lá: Lành tính",
                        "samples": 2,
                        "values": [
                          2,
                          0
                        ],
                        "criterion": "gini = 0.000",
                        "isLeaf": true,
                        "predictedClass": "Benign",
                        "children": []
                      },
                      {
                        "id": "root_C0_R_R_R_L_R",
                        "name": "Lá: Ác tính",
                        "samples": 2,
                        "values": [
                          0,
                          2
                        ],
                        "criterion": "gini = 0.000",
                        "isLeaf": true,
                        "predictedClass": "Malignant",
                        "children": []
                      }
                    ]
                  },
                  {
                    "id": "root_C0_R_R_R_R",
                    "name": "Lá: Ác tính",
                    "samples": 142,
                    "values": [
                      0,
                      142
                    ],
                    "criterion": "gini = 0.000",
                    "isLeaf": true,
                    "predictedClass": "Malignant",
                    "children": []
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  "I1": {
    "id": "root_I1",
    "name": "Chu vi xấu nhất (perimeter_worst) ≤ 112.80",
    "feature": "perimeter_worst",
    "threshold": 112.8,
    "criterion": "gini = 0.468",
    "samples": 455,
    "values": [
      285,
      170
    ],
    "isLeaf": false,
    "children": [
      {
        "id": "root_I1_L",
        "name": "Điểm lõm xấu nhất (concave_points_worst) ≤ 0.16",
        "feature": "concave_points_worst",
        "threshold": 0.1603,
        "criterion": "gini = 0.137",
        "samples": 297,
        "values": [
          275,
          22
        ],
        "isLeaf": false,
        "children": [
          {
            "id": "root_I1_L_L",
            "name": "Diện tích trung bình (area_mean) ≤ 696.25",
            "feature": "area_mean",
            "threshold": 696.25,
            "criterion": "gini = 0.081",
            "samples": 285,
            "values": [
              273,
              12
            ],
            "isLeaf": false,
            "children": [
              {
                "id": "root_I1_L_L_L",
                "name": "Độ mịn xấu nhất (smoothness_worst) ≤ 0.18",
                "feature": "smoothness_worst",
                "threshold": 0.1782,
                "criterion": "gini = 0.056",
                "samples": 279,
                "values": [
                  271,
                  8
                ],
                "isLeaf": false,
                "children": [
                  {
                    "id": "root_I1_L_L_L_L",
                    "name": "Chu vi xấu nhất (perimeter_worst) ≤ 102.40",
                    "feature": "perimeter_worst",
                    "threshold": 102.4,
                    "criterion": "gini = 0.036",
                    "samples": 274,
                    "values": [
                      269,
                      5
                    ],
                    "isLeaf": false,
                    "children": [
                      {
                        "id": "root_I1_L_L_L_L_L",
                        "name": "Sai số diện tích (area_se) ≤ 47.03",
                        "feature": "area_se",
                        "threshold": 47.035,
                        "criterion": "gini = 0.016",
                        "samples": 247,
                        "values": [
                          245,
                          2
                        ],
                        "isLeaf": false,
                        "children": [
                          {
                            "id": "root_I1_L_L_L_L_L_L",
                            "name": "Độ nhám xấu nhất (texture_worst) ≤ 33.35",
                            "feature": "texture_worst",
                            "threshold": 33.35,
                            "criterion": "gini = 0.008",
                            "samples": 243,
                            "values": [
                              242,
                              1
                            ],
                            "isLeaf": false,
                            "children": [
                              {
                                "id": "root_I1_L_L_L_L_L_L_L",
                                "name": "Lá: Lành tính",
                                "samples": 229,
                                "values": [
                                  229,
                                  0
                                ],
                                "criterion": "gini = 0.000",
                                "isLeaf": true,
                                "predictedClass": "Benign",
                                "children": []
                              },
                              {
                                "id": "root_I1_L_L_L_L_L_L_R",
                                "name": "Độ nhám trung bình (texture_mean) ≤ 23.20",
                                "feature": "texture_mean",
                                "threshold": 23.2,
                                "criterion": "gini = 0.133",
                                "samples": 14,
                                "values": [
                                  13,
                                  1
                                ],
                                "isLeaf": false,
                                "children": [
                                  {
                                    "id": "root_I1_L_L_L_L_L_L_R_L",
                                    "name": "Lá: Ác tính",
                                    "samples": 1,
                                    "values": [
                                      0,
                                      1
                                    ],
                                    "criterion": "gini = 0.000",
                                    "isLeaf": true,
                                    "predictedClass": "Malignant",
                                    "children": []
                                  },
                                  {
                                    "id": "root_I1_L_L_L_L_L_L_R_R",
                                    "name": "Lá: Lành tính",
                                    "samples": 13,
                                    "values": [
                                      13,
                                      0
                                    ],
                                    "criterion": "gini = 0.000",
                                    "isLeaf": true,
                                    "predictedClass": "Benign",
                                    "children": []
                                  }
                                ]
                              }
                            ]
                          },
                          {
                            "id": "root_I1_L_L_L_L_L_R",
                            "name": "Độ nén trung bình (compactness_mean) ≤ 0.06",
                            "feature": "compactness_mean",
                            "threshold": 0.0626,
                            "criterion": "gini = 0.375",
                            "samples": 4,
                            "values": [
                              3,
                              1
                            ],
                            "isLeaf": false,
                            "children": [
                              {
                                "id": "root_I1_L_L_L_L_L_R_L",
                                "name": "Lá: Ác tính",
                                "samples": 1,
                                "values": [
                                  0,
                                  1
                                ],
                                "criterion": "gini = 0.000",
                                "isLeaf": true,
                                "predictedClass": "Malignant",
                                "children": []
                              },
                              {
                                "id": "root_I1_L_L_L_L_L_R_R",
                                "name": "Lá: Lành tính",
                                "samples": 3,
                                "values": [
                                  3,
                                  0
                                ],
                                "criterion": "gini = 0.000",
                                "isLeaf": true,
                                "predictedClass": "Benign",
                                "children": []
                              }
                            ]
                          }
                        ]
                      },
                      {
                        "id": "root_I1_L_L_L_L_R",
                        "name": "Độ mịn xấu nhất (smoothness_worst) ≤ 0.14",
                        "feature": "smoothness_worst",
                        "threshold": 0.1363,
                        "criterion": "gini = 0.198",
                        "samples": 27,
                        "values": [
                          24,
                          3
                        ],
                        "isLeaf": false,
                        "children": [
                          {
                            "id": "root_I1_L_L_L_L_R_L",
                            "name": "Sai số chu vi (perimeter_se) ≤ 1.58",
                            "feature": "perimeter_se",
                            "threshold": 1.584,
                            "criterion": "gini = 0.077",
                            "samples": 25,
                            "values": [
                              24,
                              1
                            ],
                            "isLeaf": false,
                            "children": [
                              {
                                "id": "root_I1_L_L_L_L_R_L_L",
                                "name": "Bán kính trung bình (radius_mean) ≤ 14.04",
                                "feature": "radius_mean",
                                "threshold": 14.04,
                                "criterion": "gini = 0.500",
                                "samples": 2,
                                "values": [
                                  1,
                                  1
                                ],
                                "isLeaf": false,
                                "children": [
                                  {
                                    "id": "root_I1_L_L_L_L_R_L_L_L",
                                    "name": "Lá: Ác tính",
                                    "samples": 1,
                                    "values": [
                                      0,
                                      1
                                    ],
                                    "criterion": "gini = 0.000",
                                    "isLeaf": true,
                                    "predictedClass": "Malignant",
                                    "children": []
                                  },
                                  {
                                    "id": "root_I1_L_L_L_L_R_L_L_R",
                                    "name": "Lá: Lành tính",
                                    "samples": 1,
                                    "values": [
                                      1,
                                      0
                                    ],
                                    "criterion": "gini = 0.000",
                                    "isLeaf": true,
                                    "predictedClass": "Benign",
                                    "children": []
                                  }
                                ]
                              },
                              {
                                "id": "root_I1_L_L_L_L_R_L_R",
                                "name": "Lá: Lành tính",
                                "samples": 23,
                                "values": [
                                  23,
                                  0
                                ],
                                "criterion": "gini = 0.000",
                                "isLeaf": true,
                                "predictedClass": "Benign",
                                "children": []
                              }
                            ]
                          },
                          {
                            "id": "root_I1_L_L_L_L_R_R",
                            "name": "Lá: Ác tính",
                            "samples": 2,
                            "values": [
                              0,
                              2
                            ],
                            "criterion": "gini = 0.000",
                            "isLeaf": true,
                            "predictedClass": "Malignant",
                            "children": []
                          }
                        ]
                      }
                    ]
                  },
                  {
                    "id": "root_I1_L_L_L_R",
                    "name": "Bán kính trung bình (radius_mean) ≤ 10.12",
                    "feature": "radius_mean",
                    "threshold": 10.1225,
                    "criterion": "gini = 0.480",
                    "samples": 5,
                    "values": [
                      2,
                      3
                    ],
                    "isLeaf": false,
                    "children": [
                      {
                        "id": "root_I1_L_L_L_R_L",
                        "name": "Lá: Lành tính",
                        "samples": 2,
                        "values": [
                          2,
                          0
                        ],
                        "criterion": "gini = 0.000",
                        "isLeaf": true,
                        "predictedClass": "Benign",
                        "children": []
                      },
                      {
                        "id": "root_I1_L_L_L_R_R",
                        "name": "Lá: Ác tính",
                        "samples": 3,
                        "values": [
                          0,
                          3
                        ],
                        "criterion": "gini = 0.000",
                        "isLeaf": true,
                        "predictedClass": "Malignant",
                        "children": []
                      }
                    ]
                  }
                ]
              },
              {
                "id": "root_I1_L_L_R",
                "name": "Độ nhám trung bình (texture_mean) ≤ 19.23",
                "feature": "texture_mean",
                "threshold": 19.23,
                "criterion": "gini = 0.444",
                "samples": 6,
                "values": [
                  2,
                  4
                ],
                "isLeaf": false,
                "children": [
                  {
                    "id": "root_I1_L_L_R_L",
                    "name": "Lá: Lành tính",
                    "samples": 2,
                    "values": [
                      2,
                      0
                    ],
                    "criterion": "gini = 0.000",
                    "isLeaf": true,
                    "predictedClass": "Benign",
                    "children": []
                  },
                  {
                    "id": "root_I1_L_L_R_R",
                    "name": "Lá: Ác tính",
                    "samples": 4,
                    "values": [
                      0,
                      4
                    ],
                    "criterion": "gini = 0.000",
                    "isLeaf": true,
                    "predictedClass": "Malignant",
                    "children": []
                  }
                ]
              }
            ]
          },
          {
            "id": "root_I1_L_R",
            "name": "Độ nhám xấu nhất (texture_worst) ≤ 24.79",
            "feature": "texture_worst",
            "threshold": 24.785,
            "criterion": "gini = 0.278",
            "samples": 12,
            "values": [
              2,
              10
            ],
            "isLeaf": false,
            "children": [
              {
                "id": "root_I1_L_R_L",
                "name": "Độ nhám trung bình (texture_mean) ≤ 15.71",
                "feature": "texture_mean",
                "threshold": 15.71,
                "criterion": "gini = 0.444",
                "samples": 3,
                "values": [
                  2,
                  1
                ],
                "isLeaf": false,
                "children": [
                  {
                    "id": "root_I1_L_R_L_L",
                    "name": "Lá: Ác tính",
                    "samples": 1,
                    "values": [
                      0,
                      1
                    ],
                    "criterion": "gini = 0.000",
                    "isLeaf": true,
                    "predictedClass": "Malignant",
                    "children": []
                  },
                  {
                    "id": "root_I1_L_R_L_R",
                    "name": "Lá: Lành tính",
                    "samples": 2,
                    "values": [
                      2,
                      0
                    ],
                    "criterion": "gini = 0.000",
                    "isLeaf": true,
                    "predictedClass": "Benign",
                    "children": []
                  }
                ]
              },
              {
                "id": "root_I1_L_R_R",
                "name": "Lá: Ác tính",
                "samples": 9,
                "values": [
                  0,
                  9
                ],
                "criterion": "gini = 0.000",
                "isLeaf": true,
                "predictedClass": "Malignant",
                "children": []
              }
            ]
          }
        ]
      },
      {
        "id": "root_I1_R",
        "name": "Độ nhám trung bình (texture_mean) ≤ 14.96",
        "feature": "texture_mean",
        "threshold": 14.955,
        "criterion": "gini = 0.119",
        "samples": 158,
        "values": [
          10,
          148
        ],
        "isLeaf": false,
        "children": [
          {
            "id": "root_I1_R_L",
            "name": "Độ nhám trung bình (texture_mean) ≤ 12.40",
            "feature": "texture_mean",
            "threshold": 12.4,
            "criterion": "gini = 0.408",
            "samples": 7,
            "values": [
              5,
              2
            ],
            "isLeaf": false,
            "children": [
              {
                "id": "root_I1_R_L_L",
                "name": "Lá: Ác tính",
                "samples": 2,
                "values": [
                  0,
                  2
                ],
                "criterion": "gini = 0.000",
                "isLeaf": true,
                "predictedClass": "Malignant",
                "children": []
              },
              {
                "id": "root_I1_R_L_R",
                "name": "Lá: Lành tính",
                "samples": 5,
                "values": [
                  5,
                  0
                ],
                "criterion": "gini = 0.000",
                "isLeaf": true,
                "predictedClass": "Benign",
                "children": []
              }
            ]
          },
          {
            "id": "root_I1_R_R",
            "name": "Diện tích xấu nhất (area_worst) ≤ 810.10",
            "feature": "area_worst",
            "threshold": 810.1,
            "criterion": "gini = 0.064",
            "samples": 151,
            "values": [
              5,
              146
            ],
            "isLeaf": false,
            "children": [
              {
                "id": "root_I1_R_R_L",
                "name": "Độ mịn trung bình (smoothness_mean) ≤ 0.09",
                "feature": "smoothness_mean",
                "threshold": 0.0933,
                "criterion": "gini = 0.480",
                "samples": 5,
                "values": [
                  3,
                  2
                ],
                "isLeaf": false,
                "children": [
                  {
                    "id": "root_I1_R_R_L_L",
                    "name": "Lá: Lành tính",
                    "samples": 3,
                    "values": [
                      3,
                      0
                    ],
                    "criterion": "gini = 0.000",
                    "isLeaf": true,
                    "predictedClass": "Benign",
                    "children": []
                  },
                  {
                    "id": "root_I1_R_R_L_R",
                    "name": "Lá: Ác tính",
                    "samples": 2,
                    "values": [
                      0,
                      2
                    ],
                    "criterion": "gini = 0.000",
                    "isLeaf": true,
                    "predictedClass": "Malignant",
                    "children": []
                  }
                ]
              },
              {
                "id": "root_I1_R_R_R",
                "name": "Độ mịn xấu nhất (smoothness_worst) ≤ 0.09",
                "feature": "smoothness_worst",
                "threshold": 0.088,
                "criterion": "gini = 0.027",
                "samples": 146,
                "values": [
                  2,
                  144
                ],
                "isLeaf": false,
                "children": [
                  {
                    "id": "root_I1_R_R_R_L",
                    "name": "Lá: Lành tính",
                    "samples": 1,
                    "values": [
                      1,
                      0
                    ],
                    "criterion": "gini = 0.000",
                    "isLeaf": true,
                    "predictedClass": "Benign",
                    "children": []
                  },
                  {
                    "id": "root_I1_R_R_R_R",
                    "name": "Độ lõm xấu nhất (concavity_worst) ≤ 0.19",
                    "feature": "concavity_worst",
                    "threshold": 0.1871,
                    "criterion": "gini = 0.014",
                    "samples": 145,
                    "values": [
                      1,
                      144
                    ],
                    "isLeaf": false,
                    "children": [
                      {
                        "id": "root_I1_R_R_R_R_L",
                        "name": "Độ nhám trung bình (texture_mean) ≤ 20.67",
                        "feature": "texture_mean",
                        "threshold": 20.675,
                        "criterion": "gini = 0.444",
                        "samples": 3,
                        "values": [
                          1,
                          2
                        ],
                        "isLeaf": false,
                        "children": [
                          {
                            "id": "root_I1_R_R_R_R_L_L",
                            "name": "Lá: Lành tính",
                            "samples": 1,
                            "values": [
                              1,
                              0
                            ],
                            "criterion": "gini = 0.000",
                            "isLeaf": true,
                            "predictedClass": "Benign",
                            "children": []
                          },
                          {
                            "id": "root_I1_R_R_R_R_L_R",
                            "name": "Lá: Ác tính",
                            "samples": 2,
                            "values": [
                              0,
                              2
                            ],
                            "criterion": "gini = 0.000",
                            "isLeaf": true,
                            "predictedClass": "Malignant",
                            "children": []
                          }
                        ]
                      },
                      {
                        "id": "root_I1_R_R_R_R_R",
                        "name": "Lá: Ác tính",
                        "samples": 142,
                        "values": [
                          0,
                          142
                        ],
                        "criterion": "gini = 0.000",
                        "isLeaf": true,
                        "predictedClass": "Malignant",
                        "children": []
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  "I2": {
    "id": "root_I2",
    "name": "Chu vi xấu nhất (perimeter_worst) ≤ 114.45",
    "feature": "perimeter_worst",
    "threshold": 114.45,
    "criterion": "entropy = 0.953",
    "samples": 455,
    "values": [
      285,
      170
    ],
    "isLeaf": false,
    "children": [
      {
        "id": "root_I2_L",
        "name": "Điểm lõm xấu nhất (concave_points_worst) ≤ 0.11",
        "feature": "concave_points_worst",
        "threshold": 0.111,
        "criterion": "entropy = 0.439",
        "samples": 308,
        "values": [
          280,
          28
        ],
        "isLeaf": false,
        "children": [
          {
            "id": "root_I2_L_L",
            "name": "Sai số diện tích (area_se) ≤ 45.17",
            "feature": "area_se",
            "threshold": 45.17,
            "criterion": "entropy = 0.120",
            "samples": 245,
            "values": [
              241,
              4
            ],
            "isLeaf": false,
            "children": [
              {
                "id": "root_I2_L_L_L",
                "name": "Độ nhám xấu nhất (texture_worst) ≤ 33.35",
                "feature": "texture_worst",
                "threshold": 33.35,
                "criterion": "entropy = 0.039",
                "samples": 238,
                "values": [
                  237,
                  1
                ],
                "isLeaf": false,
                "children": [
                  {
                    "id": "root_I2_L_L_L_L",
                    "name": "Lá: Lành tính",
                    "samples": 223,
                    "values": [
                      223,
                      0
                    ],
                    "criterion": "entropy = -0.000",
                    "isLeaf": true,
                    "predictedClass": "Benign",
                    "children": []
                  },
                  {
                    "id": "root_I2_L_L_L_R",
                    "name": "Độ nhám trung bình (texture_mean) ≤ 23.20",
                    "feature": "texture_mean",
                    "threshold": 23.2,
                    "criterion": "entropy = 0.353",
                    "samples": 15,
                    "values": [
                      14,
                      1
                    ],
                    "isLeaf": false,
                    "children": [
                      {
                        "id": "root_I2_L_L_L_R_L",
                        "name": "Lá: Ác tính",
                        "samples": 1,
                        "values": [
                          0,
                          1
                        ],
                        "criterion": "entropy = -0.000",
                        "isLeaf": true,
                        "predictedClass": "Malignant",
                        "children": []
                      },
                      {
                        "id": "root_I2_L_L_L_R_R",
                        "name": "Lá: Lành tính",
                        "samples": 14,
                        "values": [
                          14,
                          0
                        ],
                        "criterion": "entropy = -0.000",
                        "isLeaf": true,
                        "predictedClass": "Benign",
                        "children": []
                      }
                    ]
                  }
                ]
              },
              {
                "id": "root_I2_L_L_R",
                "name": "Độ nén trung bình (compactness_mean) ≤ 0.06",
                "feature": "compactness_mean",
                "threshold": 0.0626,
                "criterion": "entropy = 0.985",
                "samples": 7,
                "values": [
                  4,
                  3
                ],
                "isLeaf": false,
                "children": [
                  {
                    "id": "root_I2_L_L_R_L",
                    "name": "Lá: Ác tính",
                    "samples": 3,
                    "values": [
                      0,
                      3
                    ],
                    "criterion": "entropy = -0.000",
                    "isLeaf": true,
                    "predictedClass": "Malignant",
                    "children": []
                  },
                  {
                    "id": "root_I2_L_L_R_R",
                    "name": "Lá: Lành tính",
                    "samples": 4,
                    "values": [
                      4,
                      0
                    ],
                    "criterion": "entropy = -0.000",
                    "isLeaf": true,
                    "predictedClass": "Benign",
                    "children": []
                  }
                ]
              }
            ]
          },
          {
            "id": "root_I2_L_R",
            "name": "Độ nhám xấu nhất (texture_worst) ≤ 25.73",
            "feature": "texture_worst",
            "threshold": 25.735,
            "criterion": "entropy = 0.959",
            "samples": 63,
            "values": [
              39,
              24
            ],
            "isLeaf": false,
            "children": [
              {
                "id": "root_I2_L_R_L",
                "name": "Sai số diện tích (area_se) ≤ 33.40",
                "feature": "area_se",
                "threshold": 33.4,
                "criterion": "entropy = 0.371",
                "samples": 28,
                "values": [
                  26,
                  2
                ],
                "isLeaf": false,
                "children": [
                  {
                    "id": "root_I2_L_R_L_L",
                    "name": "Lá: Lành tính",
                    "samples": 24,
                    "values": [
                      24,
                      0
                    ],
                    "criterion": "entropy = -0.000",
                    "isLeaf": true,
                    "predictedClass": "Benign",
                    "children": []
                  },
                  {
                    "id": "root_I2_L_R_L_R",
                    "name": "Độ nhám trung bình (texture_mean) ≤ 15.45",
                    "feature": "texture_mean",
                    "threshold": 15.45,
                    "criterion": "entropy = 1.000",
                    "samples": 4,
                    "values": [
                      2,
                      2
                    ],
                    "isLeaf": false,
                    "children": [
                      {
                        "id": "root_I2_L_R_L_R_L",
                        "name": "Lá: Lành tính",
                        "samples": 2,
                        "values": [
                          2,
                          0
                        ],
                        "criterion": "entropy = -0.000",
                        "isLeaf": true,
                        "predictedClass": "Benign",
                        "children": []
                      },
                      {
                        "id": "root_I2_L_R_L_R_R",
                        "name": "Lá: Ác tính",
                        "samples": 2,
                        "values": [
                          0,
                          2
                        ],
                        "criterion": "entropy = -0.000",
                        "isLeaf": true,
                        "predictedClass": "Malignant",
                        "children": []
                      }
                    ]
                  }
                ]
              },
              {
                "id": "root_I2_L_R_R",
                "name": "Điểm lõm trung bình (concave_points_mean) ≤ 0.05",
                "feature": "concave_points_mean",
                "threshold": 0.0549,
                "criterion": "entropy = 0.952",
                "samples": 35,
                "values": [
                  13,
                  22
                ],
                "isLeaf": false,
                "children": [
                  {
                    "id": "root_I2_L_R_R_L",
                    "name": "Bán kính xấu nhất (radius_worst) ≤ 15.40",
                    "feature": "radius_worst",
                    "threshold": 15.4,
                    "criterion": "entropy = 0.934",
                    "samples": 20,
                    "values": [
                      13,
                      7
                    ],
                    "isLeaf": false,
                    "children": [
                      {
                        "id": "root_I2_L_R_R_L_L",
                        "name": "Lá: Lành tính",
                        "samples": 9,
                        "values": [
                          9,
                          0
                        ],
                        "criterion": "entropy = -0.000",
                        "isLeaf": true,
                        "predictedClass": "Benign",
                        "children": []
                      },
                      {
                        "id": "root_I2_L_R_R_L_R",
                        "name": "Độ mịn trung bình (smoothness_mean) ≤ 0.09",
                        "feature": "smoothness_mean",
                        "threshold": 0.0902,
                        "criterion": "entropy = 0.946",
                        "samples": 11,
                        "values": [
                          4,
                          7
                        ],
                        "isLeaf": false,
                        "children": [
                          {
                            "id": "root_I2_L_R_R_L_R_L",
                            "name": "Độ mịn trung bình (smoothness_mean) ≤ 0.08",
                            "feature": "smoothness_mean",
                            "threshold": 0.0846,
                            "criterion": "entropy = 0.918",
                            "samples": 6,
                            "values": [
                              4,
                              2
                            ],
                            "isLeaf": false,
                            "children": [
                              {
                                "id": "root_I2_L_R_R_L_R_L_L",
                                "name": "Lá: Ác tính",
                                "samples": 2,
                                "values": [
                                  0,
                                  2
                                ],
                                "criterion": "entropy = -0.000",
                                "isLeaf": true,
                                "predictedClass": "Malignant",
                                "children": []
                              },
                              {
                                "id": "root_I2_L_R_R_L_R_L_R",
                                "name": "Lá: Lành tính",
                                "samples": 4,
                                "values": [
                                  4,
                                  0
                                ],
                                "criterion": "entropy = -0.000",
                                "isLeaf": true,
                                "predictedClass": "Benign",
                                "children": []
                              }
                            ]
                          },
                          {
                            "id": "root_I2_L_R_R_L_R_R",
                            "name": "Lá: Ác tính",
                            "samples": 5,
                            "values": [
                              0,
                              5
                            ],
                            "criterion": "entropy = -0.000",
                            "isLeaf": true,
                            "predictedClass": "Malignant",
                            "children": []
                          }
                        ]
                      }
                    ]
                  },
                  {
                    "id": "root_I2_L_R_R_R",
                    "name": "Lá: Ác tính",
                    "samples": 15,
                    "values": [
                      0,
                      15
                    ],
                    "criterion": "entropy = -0.000",
                    "isLeaf": true,
                    "predictedClass": "Malignant",
                    "children": []
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "root_I2_R",
        "name": "Điểm lõm trung bình (concave_points_mean) ≤ 0.05",
        "feature": "concave_points_mean",
        "threshold": 0.0501,
        "criterion": "entropy = 0.214",
        "samples": 147,
        "values": [
          5,
          142
        ],
        "isLeaf": false,
        "children": [
          {
            "id": "root_I2_R_L",
            "name": "Độ nhám xấu nhất (texture_worst) ≤ 28.97",
            "feature": "texture_worst",
            "threshold": 28.97,
            "criterion": "entropy = 0.980",
            "samples": 12,
            "values": [
              5,
              7
            ],
            "isLeaf": false,
            "children": [
              {
                "id": "root_I2_R_L_L",
                "name": "Độ nhám trung bình (texture_mean) ≤ 20.16",
                "feature": "texture_mean",
                "threshold": 20.165,
                "criterion": "entropy = 0.650",
                "samples": 6,
                "values": [
                  5,
                  1
                ],
                "isLeaf": false,
                "children": [
                  {
                    "id": "root_I2_R_L_L_L",
                    "name": "Lá: Lành tính",
                    "samples": 5,
                    "values": [
                      5,
                      0
                    ],
                    "criterion": "entropy = -0.000",
                    "isLeaf": true,
                    "predictedClass": "Benign",
                    "children": []
                  },
                  {
                    "id": "root_I2_R_L_L_R",
                    "name": "Lá: Ác tính",
                    "samples": 1,
                    "values": [
                      0,
                      1
                    ],
                    "criterion": "entropy = -0.000",
                    "isLeaf": true,
                    "predictedClass": "Malignant",
                    "children": []
                  }
                ]
              },
              {
                "id": "root_I2_R_L_R",
                "name": "Lá: Ác tính",
                "samples": 6,
                "values": [
                  0,
                  6
                ],
                "criterion": "entropy = -0.000",
                "isLeaf": true,
                "predictedClass": "Malignant",
                "children": []
              }
            ]
          },
          {
            "id": "root_I2_R_R",
            "name": "Lá: Ác tính",
            "samples": 135,
            "values": [
              0,
              135
            ],
            "criterion": "entropy = -0.000",
            "isLeaf": true,
            "predictedClass": "Malignant",
            "children": []
          }
        ]
      }
    ]
  },
  "I3": {
    "id": "root_I3",
    "name": "Chu vi xấu nhất (perimeter_worst) ≤ 112.80",
    "feature": "perimeter_worst",
    "threshold": 112.8,
    "criterion": "gini = 0.468",
    "samples": 455,
    "values": [
      285,
      170
    ],
    "isLeaf": false,
    "children": [
      {
        "id": "root_I3_L",
        "name": "Điểm lõm xấu nhất (concave_points_worst) ≤ 0.16",
        "feature": "concave_points_worst",
        "threshold": 0.1603,
        "criterion": "gini = 0.137",
        "samples": 297,
        "values": [
          275,
          22
        ],
        "isLeaf": false,
        "children": [
          {
            "id": "root_I3_L_L",
            "name": "Diện tích trung bình (area_mean) ≤ 696.25",
            "feature": "area_mean",
            "threshold": 696.25,
            "criterion": "gini = 0.081",
            "samples": 285,
            "values": [
              273,
              12
            ],
            "isLeaf": false,
            "children": [
              {
                "id": "root_I3_L_L_L",
                "name": "Độ mịn xấu nhất (smoothness_worst) ≤ 0.18",
                "feature": "smoothness_worst",
                "threshold": 0.1782,
                "criterion": "gini = 0.056",
                "samples": 279,
                "values": [
                  271,
                  8
                ],
                "isLeaf": false,
                "children": [
                  {
                    "id": "root_I3_L_L_L_L",
                    "name": "Chu vi xấu nhất (perimeter_worst) ≤ 102.40",
                    "feature": "perimeter_worst",
                    "threshold": 102.4,
                    "criterion": "gini = 0.036",
                    "samples": 274,
                    "values": [
                      269,
                      5
                    ],
                    "isLeaf": false,
                    "children": [
                      {
                        "id": "root_I3_L_L_L_L_L",
                        "name": "Sai số diện tích (area_se) ≤ 47.03",
                        "feature": "area_se",
                        "threshold": 47.035,
                        "criterion": "gini = 0.016",
                        "samples": 247,
                        "values": [
                          245,
                          2
                        ],
                        "isLeaf": false,
                        "children": [
                          {
                            "id": "root_I3_L_L_L_L_L_L",
                            "name": "Độ nhám xấu nhất (texture_worst) ≤ 33.35",
                            "feature": "texture_worst",
                            "threshold": 33.35,
                            "criterion": "gini = 0.008",
                            "samples": 243,
                            "values": [
                              242,
                              1
                            ],
                            "isLeaf": false,
                            "children": [
                              {
                                "id": "root_I3_L_L_L_L_L_L_L",
                                "name": "Lá: Lành tính",
                                "samples": 229,
                                "values": [
                                  229,
                                  0
                                ],
                                "criterion": "gini = 0.000",
                                "isLeaf": true,
                                "predictedClass": "Benign",
                                "children": []
                              },
                              {
                                "id": "root_I3_L_L_L_L_L_L_R",
                                "name": "Độ nhám trung bình (texture_mean) ≤ 23.20",
                                "feature": "texture_mean",
                                "threshold": 23.2,
                                "criterion": "gini = 0.133",
                                "samples": 14,
                                "values": [
                                  13,
                                  1
                                ],
                                "isLeaf": false,
                                "children": [
                                  {
                                    "id": "root_I3_L_L_L_L_L_L_R_L",
                                    "name": "Lá: Ác tính",
                                    "samples": 1,
                                    "values": [
                                      0,
                                      1
                                    ],
                                    "criterion": "gini = 0.000",
                                    "isLeaf": true,
                                    "predictedClass": "Malignant",
                                    "children": []
                                  },
                                  {
                                    "id": "root_I3_L_L_L_L_L_L_R_R",
                                    "name": "Lá: Lành tính",
                                    "samples": 13,
                                    "values": [
                                      13,
                                      0
                                    ],
                                    "criterion": "gini = 0.000",
                                    "isLeaf": true,
                                    "predictedClass": "Benign",
                                    "children": []
                                  }
                                ]
                              }
                            ]
                          },
                          {
                            "id": "root_I3_L_L_L_L_L_R",
                            "name": "Lá: Lành tính",
                            "samples": 4,
                            "values": [
                              3,
                              1
                            ],
                            "criterion": "gini = 0.375",
                            "isLeaf": true,
                            "predictedClass": "Benign",
                            "children": []
                          }
                        ]
                      },
                      {
                        "id": "root_I3_L_L_L_L_R",
                        "name": "Độ mịn xấu nhất (smoothness_worst) ≤ 0.14",
                        "feature": "smoothness_worst",
                        "threshold": 0.1363,
                        "criterion": "gini = 0.198",
                        "samples": 27,
                        "values": [
                          24,
                          3
                        ],
                        "isLeaf": false,
                        "children": [
                          {
                            "id": "root_I3_L_L_L_L_R_L",
                            "name": "Sai số chu vi (perimeter_se) ≤ 1.58",
                            "feature": "perimeter_se",
                            "threshold": 1.584,
                            "criterion": "gini = 0.077",
                            "samples": 25,
                            "values": [
                              24,
                              1
                            ],
                            "isLeaf": false,
                            "children": [
                              {
                                "id": "root_I3_L_L_L_L_R_L_L",
                                "name": "Lá: Lành tính",
                                "samples": 2,
                                "values": [
                                  1,
                                  1
                                ],
                                "criterion": "gini = 0.500",
                                "isLeaf": true,
                                "predictedClass": "Benign",
                                "children": []
                              },
                              {
                                "id": "root_I3_L_L_L_L_R_L_R",
                                "name": "Lá: Lành tính",
                                "samples": 23,
                                "values": [
                                  23,
                                  0
                                ],
                                "criterion": "gini = 0.000",
                                "isLeaf": true,
                                "predictedClass": "Benign",
                                "children": []
                              }
                            ]
                          },
                          {
                            "id": "root_I3_L_L_L_L_R_R",
                            "name": "Lá: Ác tính",
                            "samples": 2,
                            "values": [
                              0,
                              2
                            ],
                            "criterion": "gini = 0.000",
                            "isLeaf": true,
                            "predictedClass": "Malignant",
                            "children": []
                          }
                        ]
                      }
                    ]
                  },
                  {
                    "id": "root_I3_L_L_L_R",
                    "name": "Bán kính trung bình (radius_mean) ≤ 10.12",
                    "feature": "radius_mean",
                    "threshold": 10.1225,
                    "criterion": "gini = 0.480",
                    "samples": 5,
                    "values": [
                      2,
                      3
                    ],
                    "isLeaf": false,
                    "children": [
                      {
                        "id": "root_I3_L_L_L_R_L",
                        "name": "Lá: Lành tính",
                        "samples": 2,
                        "values": [
                          2,
                          0
                        ],
                        "criterion": "gini = 0.000",
                        "isLeaf": true,
                        "predictedClass": "Benign",
                        "children": []
                      },
                      {
                        "id": "root_I3_L_L_L_R_R",
                        "name": "Lá: Ác tính",
                        "samples": 3,
                        "values": [
                          0,
                          3
                        ],
                        "criterion": "gini = 0.000",
                        "isLeaf": true,
                        "predictedClass": "Malignant",
                        "children": []
                      }
                    ]
                  }
                ]
              },
              {
                "id": "root_I3_L_L_R",
                "name": "Độ nhám trung bình (texture_mean) ≤ 19.23",
                "feature": "texture_mean",
                "threshold": 19.23,
                "criterion": "gini = 0.444",
                "samples": 6,
                "values": [
                  2,
                  4
                ],
                "isLeaf": false,
                "children": [
                  {
                    "id": "root_I3_L_L_R_L",
                    "name": "Lá: Lành tính",
                    "samples": 2,
                    "values": [
                      2,
                      0
                    ],
                    "criterion": "gini = 0.000",
                    "isLeaf": true,
                    "predictedClass": "Benign",
                    "children": []
                  },
                  {
                    "id": "root_I3_L_L_R_R",
                    "name": "Lá: Ác tính",
                    "samples": 4,
                    "values": [
                      0,
                      4
                    ],
                    "criterion": "gini = 0.000",
                    "isLeaf": true,
                    "predictedClass": "Malignant",
                    "children": []
                  }
                ]
              }
            ]
          },
          {
            "id": "root_I3_L_R",
            "name": "Độ nhám xấu nhất (texture_worst) ≤ 24.79",
            "feature": "texture_worst",
            "threshold": 24.785,
            "criterion": "gini = 0.278",
            "samples": 12,
            "values": [
              2,
              10
            ],
            "isLeaf": false,
            "children": [
              {
                "id": "root_I3_L_R_L",
                "name": "Lá: Lành tính",
                "samples": 3,
                "values": [
                  2,
                  1
                ],
                "criterion": "gini = 0.444",
                "isLeaf": true,
                "predictedClass": "Benign",
                "children": []
              },
              {
                "id": "root_I3_L_R_R",
                "name": "Lá: Ác tính",
                "samples": 9,
                "values": [
                  0,
                  9
                ],
                "criterion": "gini = 0.000",
                "isLeaf": true,
                "predictedClass": "Malignant",
                "children": []
              }
            ]
          }
        ]
      },
      {
        "id": "root_I3_R",
        "name": "Độ nhám trung bình (texture_mean) ≤ 14.96",
        "feature": "texture_mean",
        "threshold": 14.955,
        "criterion": "gini = 0.119",
        "samples": 158,
        "values": [
          10,
          148
        ],
        "isLeaf": false,
        "children": [
          {
            "id": "root_I3_R_L",
            "name": "Độ nhám trung bình (texture_mean) ≤ 12.40",
            "feature": "texture_mean",
            "threshold": 12.4,
            "criterion": "gini = 0.408",
            "samples": 7,
            "values": [
              5,
              2
            ],
            "isLeaf": false,
            "children": [
              {
                "id": "root_I3_R_L_L",
                "name": "Lá: Ác tính",
                "samples": 2,
                "values": [
                  0,
                  2
                ],
                "criterion": "gini = 0.000",
                "isLeaf": true,
                "predictedClass": "Malignant",
                "children": []
              },
              {
                "id": "root_I3_R_L_R",
                "name": "Lá: Lành tính",
                "samples": 5,
                "values": [
                  5,
                  0
                ],
                "criterion": "gini = 0.000",
                "isLeaf": true,
                "predictedClass": "Benign",
                "children": []
              }
            ]
          },
          {
            "id": "root_I3_R_R",
            "name": "Diện tích xấu nhất (area_worst) ≤ 810.10",
            "feature": "area_worst",
            "threshold": 810.1,
            "criterion": "gini = 0.064",
            "samples": 151,
            "values": [
              5,
              146
            ],
            "isLeaf": false,
            "children": [
              {
                "id": "root_I3_R_R_L",
                "name": "Độ mịn trung bình (smoothness_mean) ≤ 0.09",
                "feature": "smoothness_mean",
                "threshold": 0.0933,
                "criterion": "gini = 0.480",
                "samples": 5,
                "values": [
                  3,
                  2
                ],
                "isLeaf": false,
                "children": [
                  {
                    "id": "root_I3_R_R_L_L",
                    "name": "Lá: Lành tính",
                    "samples": 3,
                    "values": [
                      3,
                      0
                    ],
                    "criterion": "gini = 0.000",
                    "isLeaf": true,
                    "predictedClass": "Benign",
                    "children": []
                  },
                  {
                    "id": "root_I3_R_R_L_R",
                    "name": "Lá: Ác tính",
                    "samples": 2,
                    "values": [
                      0,
                      2
                    ],
                    "criterion": "gini = 0.000",
                    "isLeaf": true,
                    "predictedClass": "Malignant",
                    "children": []
                  }
                ]
              },
              {
                "id": "root_I3_R_R_R",
                "name": "Độ mịn xấu nhất (smoothness_worst) ≤ 0.09",
                "feature": "smoothness_worst",
                "threshold": 0.088,
                "criterion": "gini = 0.027",
                "samples": 146,
                "values": [
                  2,
                  144
                ],
                "isLeaf": false,
                "children": [
                  {
                    "id": "root_I3_R_R_R_L",
                    "name": "Lá: Lành tính",
                    "samples": 1,
                    "values": [
                      1,
                      0
                    ],
                    "criterion": "gini = 0.000",
                    "isLeaf": true,
                    "predictedClass": "Benign",
                    "children": []
                  },
                  {
                    "id": "root_I3_R_R_R_R",
                    "name": "Độ lõm xấu nhất (concavity_worst) ≤ 0.19",
                    "feature": "concavity_worst",
                    "threshold": 0.1871,
                    "criterion": "gini = 0.014",
                    "samples": 145,
                    "values": [
                      1,
                      144
                    ],
                    "isLeaf": false,
                    "children": [
                      {
                        "id": "root_I3_R_R_R_R_L",
                        "name": "Lá: Ác tính",
                        "samples": 3,
                        "values": [
                          1,
                          2
                        ],
                        "criterion": "gini = 0.444",
                        "isLeaf": true,
                        "predictedClass": "Malignant",
                        "children": []
                      },
                      {
                        "id": "root_I3_R_R_R_R_R",
                        "name": "Lá: Ác tính",
                        "samples": 142,
                        "values": [
                          0,
                          142
                        ],
                        "criterion": "gini = 0.000",
                        "isLeaf": true,
                        "predictedClass": "Malignant",
                        "children": []
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  "best": {
    "id": "root_I3",
    "name": "Chu vi xấu nhất (perimeter_worst) ≤ 112.80",
    "feature": "perimeter_worst",
    "threshold": 112.8,
    "criterion": "gini = 0.468",
    "samples": 455,
    "values": [
      285,
      170
    ],
    "isLeaf": false,
    "children": [
      {
        "id": "root_I3_L",
        "name": "Điểm lõm xấu nhất (concave_points_worst) ≤ 0.16",
        "feature": "concave_points_worst",
        "threshold": 0.1603,
        "criterion": "gini = 0.137",
        "samples": 297,
        "values": [
          275,
          22
        ],
        "isLeaf": false,
        "children": [
          {
            "id": "root_I3_L_L",
            "name": "Diện tích trung bình (area_mean) ≤ 696.25",
            "feature": "area_mean",
            "threshold": 696.25,
            "criterion": "gini = 0.081",
            "samples": 285,
            "values": [
              273,
              12
            ],
            "isLeaf": false,
            "children": [
              {
                "id": "root_I3_L_L_L",
                "name": "Độ mịn xấu nhất (smoothness_worst) ≤ 0.18",
                "feature": "smoothness_worst",
                "threshold": 0.1782,
                "criterion": "gini = 0.056",
                "samples": 279,
                "values": [
                  271,
                  8
                ],
                "isLeaf": false,
                "children": [
                  {
                    "id": "root_I3_L_L_L_L",
                    "name": "Chu vi xấu nhất (perimeter_worst) ≤ 102.40",
                    "feature": "perimeter_worst",
                    "threshold": 102.4,
                    "criterion": "gini = 0.036",
                    "samples": 274,
                    "values": [
                      269,
                      5
                    ],
                    "isLeaf": false,
                    "children": [
                      {
                        "id": "root_I3_L_L_L_L_L",
                        "name": "Sai số diện tích (area_se) ≤ 47.03",
                        "feature": "area_se",
                        "threshold": 47.035,
                        "criterion": "gini = 0.016",
                        "samples": 247,
                        "values": [
                          245,
                          2
                        ],
                        "isLeaf": false,
                        "children": [
                          {
                            "id": "root_I3_L_L_L_L_L_L",
                            "name": "Độ nhám xấu nhất (texture_worst) ≤ 33.35",
                            "feature": "texture_worst",
                            "threshold": 33.35,
                            "criterion": "gini = 0.008",
                            "samples": 243,
                            "values": [
                              242,
                              1
                            ],
                            "isLeaf": false,
                            "children": [
                              {
                                "id": "root_I3_L_L_L_L_L_L_L",
                                "name": "Lá: Lành tính",
                                "samples": 229,
                                "values": [
                                  229,
                                  0
                                ],
                                "criterion": "gini = 0.000",
                                "isLeaf": true,
                                "predictedClass": "Benign",
                                "children": []
                              },
                              {
                                "id": "root_I3_L_L_L_L_L_L_R",
                                "name": "Độ nhám trung bình (texture_mean) ≤ 23.20",
                                "feature": "texture_mean",
                                "threshold": 23.2,
                                "criterion": "gini = 0.133",
                                "samples": 14,
                                "values": [
                                  13,
                                  1
                                ],
                                "isLeaf": false,
                                "children": [
                                  {
                                    "id": "root_I3_L_L_L_L_L_L_R_L",
                                    "name": "Lá: Ác tính",
                                    "samples": 1,
                                    "values": [
                                      0,
                                      1
                                    ],
                                    "criterion": "gini = 0.000",
                                    "isLeaf": true,
                                    "predictedClass": "Malignant",
                                    "children": []
                                  },
                                  {
                                    "id": "root_I3_L_L_L_L_L_L_R_R",
                                    "name": "Lá: Lành tính",
                                    "samples": 13,
                                    "values": [
                                      13,
                                      0
                                    ],
                                    "criterion": "gini = 0.000",
                                    "isLeaf": true,
                                    "predictedClass": "Benign",
                                    "children": []
                                  }
                                ]
                              }
                            ]
                          },
                          {
                            "id": "root_I3_L_L_L_L_L_R",
                            "name": "Lá: Lành tính",
                            "samples": 4,
                            "values": [
                              3,
                              1
                            ],
                            "criterion": "gini = 0.375",
                            "isLeaf": true,
                            "predictedClass": "Benign",
                            "children": []
                          }
                        ]
                      },
                      {
                        "id": "root_I3_L_L_L_L_R",
                        "name": "Độ mịn xấu nhất (smoothness_worst) ≤ 0.14",
                        "feature": "smoothness_worst",
                        "threshold": 0.1363,
                        "criterion": "gini = 0.198",
                        "samples": 27,
                        "values": [
                          24,
                          3
                        ],
                        "isLeaf": false,
                        "children": [
                          {
                            "id": "root_I3_L_L_L_L_R_L",
                            "name": "Sai số chu vi (perimeter_se) ≤ 1.58",
                            "feature": "perimeter_se",
                            "threshold": 1.584,
                            "criterion": "gini = 0.077",
                            "samples": 25,
                            "values": [
                              24,
                              1
                            ],
                            "isLeaf": false,
                            "children": [
                              {
                                "id": "root_I3_L_L_L_L_R_L_L",
                                "name": "Lá: Lành tính",
                                "samples": 2,
                                "values": [
                                  1,
                                  1
                                ],
                                "criterion": "gini = 0.500",
                                "isLeaf": true,
                                "predictedClass": "Benign",
                                "children": []
                              },
                              {
                                "id": "root_I3_L_L_L_L_R_L_R",
                                "name": "Lá: Lành tính",
                                "samples": 23,
                                "values": [
                                  23,
                                  0
                                ],
                                "criterion": "gini = 0.000",
                                "isLeaf": true,
                                "predictedClass": "Benign",
                                "children": []
                              }
                            ]
                          },
                          {
                            "id": "root_I3_L_L_L_L_R_R",
                            "name": "Lá: Ác tính",
                            "samples": 2,
                            "values": [
                              0,
                              2
                            ],
                            "criterion": "gini = 0.000",
                            "isLeaf": true,
                            "predictedClass": "Malignant",
                            "children": []
                          }
                        ]
                      }
                    ]
                  },
                  {
                    "id": "root_I3_L_L_L_R",
                    "name": "Bán kính trung bình (radius_mean) ≤ 10.12",
                    "feature": "radius_mean",
                    "threshold": 10.1225,
                    "criterion": "gini = 0.480",
                    "samples": 5,
                    "values": [
                      2,
                      3
                    ],
                    "isLeaf": false,
                    "children": [
                      {
                        "id": "root_I3_L_L_L_R_L",
                        "name": "Lá: Lành tính",
                        "samples": 2,
                        "values": [
                          2,
                          0
                        ],
                        "criterion": "gini = 0.000",
                        "isLeaf": true,
                        "predictedClass": "Benign",
                        "children": []
                      },
                      {
                        "id": "root_I3_L_L_L_R_R",
                        "name": "Lá: Ác tính",
                        "samples": 3,
                        "values": [
                          0,
                          3
                        ],
                        "criterion": "gini = 0.000",
                        "isLeaf": true,
                        "predictedClass": "Malignant",
                        "children": []
                      }
                    ]
                  }
                ]
              },
              {
                "id": "root_I3_L_L_R",
                "name": "Độ nhám trung bình (texture_mean) ≤ 19.23",
                "feature": "texture_mean",
                "threshold": 19.23,
                "criterion": "gini = 0.444",
                "samples": 6,
                "values": [
                  2,
                  4
                ],
                "isLeaf": false,
                "children": [
                  {
                    "id": "root_I3_L_L_R_L",
                    "name": "Lá: Lành tính",
                    "samples": 2,
                    "values": [
                      2,
                      0
                    ],
                    "criterion": "gini = 0.000",
                    "isLeaf": true,
                    "predictedClass": "Benign",
                    "children": []
                  },
                  {
                    "id": "root_I3_L_L_R_R",
                    "name": "Lá: Ác tính",
                    "samples": 4,
                    "values": [
                      0,
                      4
                    ],
                    "criterion": "gini = 0.000",
                    "isLeaf": true,
                    "predictedClass": "Malignant",
                    "children": []
                  }
                ]
              }
            ]
          },
          {
            "id": "root_I3_L_R",
            "name": "Độ nhám xấu nhất (texture_worst) ≤ 24.79",
            "feature": "texture_worst",
            "threshold": 24.785,
            "criterion": "gini = 0.278",
            "samples": 12,
            "values": [
              2,
              10
            ],
            "isLeaf": false,
            "children": [
              {
                "id": "root_I3_L_R_L",
                "name": "Lá: Lành tính",
                "samples": 3,
                "values": [
                  2,
                  1
                ],
                "criterion": "gini = 0.444",
                "isLeaf": true,
                "predictedClass": "Benign",
                "children": []
              },
              {
                "id": "root_I3_L_R_R",
                "name": "Lá: Ác tính",
                "samples": 9,
                "values": [
                  0,
                  9
                ],
                "criterion": "gini = 0.000",
                "isLeaf": true,
                "predictedClass": "Malignant",
                "children": []
              }
            ]
          }
        ]
      },
      {
        "id": "root_I3_R",
        "name": "Độ nhám trung bình (texture_mean) ≤ 14.96",
        "feature": "texture_mean",
        "threshold": 14.955,
        "criterion": "gini = 0.119",
        "samples": 158,
        "values": [
          10,
          148
        ],
        "isLeaf": false,
        "children": [
          {
            "id": "root_I3_R_L",
            "name": "Độ nhám trung bình (texture_mean) ≤ 12.40",
            "feature": "texture_mean",
            "threshold": 12.4,
            "criterion": "gini = 0.408",
            "samples": 7,
            "values": [
              5,
              2
            ],
            "isLeaf": false,
            "children": [
              {
                "id": "root_I3_R_L_L",
                "name": "Lá: Ác tính",
                "samples": 2,
                "values": [
                  0,
                  2
                ],
                "criterion": "gini = 0.000",
                "isLeaf": true,
                "predictedClass": "Malignant",
                "children": []
              },
              {
                "id": "root_I3_R_L_R",
                "name": "Lá: Lành tính",
                "samples": 5,
                "values": [
                  5,
                  0
                ],
                "criterion": "gini = 0.000",
                "isLeaf": true,
                "predictedClass": "Benign",
                "children": []
              }
            ]
          },
          {
            "id": "root_I3_R_R",
            "name": "Diện tích xấu nhất (area_worst) ≤ 810.10",
            "feature": "area_worst",
            "threshold": 810.1,
            "criterion": "gini = 0.064",
            "samples": 151,
            "values": [
              5,
              146
            ],
            "isLeaf": false,
            "children": [
              {
                "id": "root_I3_R_R_L",
                "name": "Độ mịn trung bình (smoothness_mean) ≤ 0.09",
                "feature": "smoothness_mean",
                "threshold": 0.0933,
                "criterion": "gini = 0.480",
                "samples": 5,
                "values": [
                  3,
                  2
                ],
                "isLeaf": false,
                "children": [
                  {
                    "id": "root_I3_R_R_L_L",
                    "name": "Lá: Lành tính",
                    "samples": 3,
                    "values": [
                      3,
                      0
                    ],
                    "criterion": "gini = 0.000",
                    "isLeaf": true,
                    "predictedClass": "Benign",
                    "children": []
                  },
                  {
                    "id": "root_I3_R_R_L_R",
                    "name": "Lá: Ác tính",
                    "samples": 2,
                    "values": [
                      0,
                      2
                    ],
                    "criterion": "gini = 0.000",
                    "isLeaf": true,
                    "predictedClass": "Malignant",
                    "children": []
                  }
                ]
              },
              {
                "id": "root_I3_R_R_R",
                "name": "Độ mịn xấu nhất (smoothness_worst) ≤ 0.09",
                "feature": "smoothness_worst",
                "threshold": 0.088,
                "criterion": "gini = 0.027",
                "samples": 146,
                "values": [
                  2,
                  144
                ],
                "isLeaf": false,
                "children": [
                  {
                    "id": "root_I3_R_R_R_L",
                    "name": "Lá: Lành tính",
                    "samples": 1,
                    "values": [
                      1,
                      0
                    ],
                    "criterion": "gini = 0.000",
                    "isLeaf": true,
                    "predictedClass": "Benign",
                    "children": []
                  },
                  {
                    "id": "root_I3_R_R_R_R",
                    "name": "Độ lõm xấu nhất (concavity_worst) ≤ 0.19",
                    "feature": "concavity_worst",
                    "threshold": 0.1871,
                    "criterion": "gini = 0.014",
                    "samples": 145,
                    "values": [
                      1,
                      144
                    ],
                    "isLeaf": false,
                    "children": [
                      {
                        "id": "root_I3_R_R_R_R_L",
                        "name": "Lá: Ác tính",
                        "samples": 3,
                        "values": [
                          1,
                          2
                        ],
                        "criterion": "gini = 0.444",
                        "isLeaf": true,
                        "predictedClass": "Malignant",
                        "children": []
                      },
                      {
                        "id": "root_I3_R_R_R_R_R",
                        "name": "Lá: Ác tính",
                        "samples": 142,
                        "values": [
                          0,
                          142
                        ],
                        "criterion": "gini = 0.000",
                        "isLeaf": true,
                        "predictedClass": "Malignant",
                        "children": []
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  "scratch": {
    "id": "root_C0",
    "name": "Chu vi xấu nhất (perimeter_worst) ≤ 112.80",
    "feature": "perimeter_worst",
    "threshold": 112.8,
    "criterion": "gini = 0.468",
    "samples": 455,
    "values": [
      285,
      170
    ],
    "isLeaf": false,
    "children": [
      {
        "id": "root_C0_L",
        "name": "Điểm lõm xấu nhất (concave_points_worst) ≤ 0.16",
        "feature": "concave_points_worst",
        "threshold": 0.1603,
        "criterion": "gini = 0.137",
        "samples": 297,
        "values": [
          275,
          22
        ],
        "isLeaf": false,
        "children": [
          {
            "id": "root_C0_L_L",
            "name": "Diện tích trung bình (area_mean) ≤ 696.25",
            "feature": "area_mean",
            "threshold": 696.25,
            "criterion": "gini = 0.081",
            "samples": 285,
            "values": [
              273,
              12
            ],
            "isLeaf": false,
            "children": [
              {
                "id": "root_C0_L_L_L",
                "name": "Độ mịn xấu nhất (smoothness_worst) ≤ 0.18",
                "feature": "smoothness_worst",
                "threshold": 0.1782,
                "criterion": "gini = 0.056",
                "samples": 279,
                "values": [
                  271,
                  8
                ],
                "isLeaf": false,
                "children": [
                  {
                    "id": "root_C0_L_L_L_L",
                    "name": "Chu vi xấu nhất (perimeter_worst) ≤ 102.40",
                    "feature": "perimeter_worst",
                    "threshold": 102.4,
                    "criterion": "gini = 0.036",
                    "samples": 274,
                    "values": [
                      269,
                      5
                    ],
                    "isLeaf": false,
                    "children": [
                      {
                        "id": "root_C0_L_L_L_L_L",
                        "name": "Lá: Lành tính",
                        "samples": 247,
                        "values": [
                          245,
                          2
                        ],
                        "criterion": "gini = 0.016",
                        "isLeaf": true,
                        "predictedClass": "Benign",
                        "children": []
                      },
                      {
                        "id": "root_C0_L_L_L_L_R",
                        "name": "Lá: Lành tính",
                        "samples": 27,
                        "values": [
                          24,
                          3
                        ],
                        "criterion": "gini = 0.198",
                        "isLeaf": true,
                        "predictedClass": "Benign",
                        "children": []
                      }
                    ]
                  },
                  {
                    "id": "root_C0_L_L_L_R",
                    "name": "Bán kính trung bình (radius_mean) ≤ 10.12",
                    "feature": "radius_mean",
                    "threshold": 10.1225,
                    "criterion": "gini = 0.480",
                    "samples": 5,
                    "values": [
                      2,
                      3
                    ],
                    "isLeaf": false,
                    "children": [
                      {
                        "id": "root_C0_L_L_L_R_L",
                        "name": "Lá: Lành tính",
                        "samples": 2,
                        "values": [
                          2,
                          0
                        ],
                        "criterion": "gini = 0.000",
                        "isLeaf": true,
                        "predictedClass": "Benign",
                        "children": []
                      },
                      {
                        "id": "root_C0_L_L_L_R_R",
                        "name": "Lá: Ác tính",
                        "samples": 3,
                        "values": [
                          0,
                          3
                        ],
                        "criterion": "gini = 0.000",
                        "isLeaf": true,
                        "predictedClass": "Malignant",
                        "children": []
                      }
                    ]
                  }
                ]
              },
              {
                "id": "root_C0_L_L_R",
                "name": "Độ nhám trung bình (texture_mean) ≤ 19.23",
                "feature": "texture_mean",
                "threshold": 19.23,
                "criterion": "gini = 0.444",
                "samples": 6,
                "values": [
                  2,
                  4
                ],
                "isLeaf": false,
                "children": [
                  {
                    "id": "root_C0_L_L_R_L",
                    "name": "Lá: Lành tính",
                    "samples": 2,
                    "values": [
                      2,
                      0
                    ],
                    "criterion": "gini = 0.000",
                    "isLeaf": true,
                    "predictedClass": "Benign",
                    "children": []
                  },
                  {
                    "id": "root_C0_L_L_R_R",
                    "name": "Lá: Ác tính",
                    "samples": 4,
                    "values": [
                      0,
                      4
                    ],
                    "criterion": "gini = 0.000",
                    "isLeaf": true,
                    "predictedClass": "Malignant",
                    "children": []
                  }
                ]
              }
            ]
          },
          {
            "id": "root_C0_L_R",
            "name": "Độ nhám xấu nhất (texture_worst) ≤ 24.79",
            "feature": "texture_worst",
            "threshold": 24.785,
            "criterion": "gini = 0.278",
            "samples": 12,
            "values": [
              2,
              10
            ],
            "isLeaf": false,
            "children": [
              {
                "id": "root_C0_L_R_L",
                "name": "Lá: Lành tính",
                "samples": 3,
                "values": [
                  2,
                  1
                ],
                "criterion": "gini = 0.444",
                "isLeaf": true,
                "predictedClass": "Benign",
                "children": []
              },
              {
                "id": "root_C0_L_R_R",
                "name": "Lá: Ác tính",
                "samples": 9,
                "values": [
                  0,
                  9
                ],
                "criterion": "gini = 0.000",
                "isLeaf": true,
                "predictedClass": "Malignant",
                "children": []
              }
            ]
          }
        ]
      },
      {
        "id": "root_C0_R",
        "name": "Độ nhám trung bình (texture_mean) ≤ 14.96",
        "feature": "texture_mean",
        "threshold": 14.955,
        "criterion": "gini = 0.119",
        "samples": 158,
        "values": [
          10,
          148
        ],
        "isLeaf": false,
        "children": [
          {
            "id": "root_C0_R_L",
            "name": "Độ nhám trung bình (texture_mean) ≤ 12.40",
            "feature": "texture_mean",
            "threshold": 12.4,
            "criterion": "gini = 0.408",
            "samples": 7,
            "values": [
              5,
              2
            ],
            "isLeaf": false,
            "children": [
              {
                "id": "root_C0_R_L_L",
                "name": "Lá: Ác tính",
                "samples": 2,
                "values": [
                  0,
                  2
                ],
                "criterion": "gini = 0.000",
                "isLeaf": true,
                "predictedClass": "Malignant",
                "children": []
              },
              {
                "id": "root_C0_R_L_R",
                "name": "Lá: Lành tính",
                "samples": 5,
                "values": [
                  5,
                  0
                ],
                "criterion": "gini = 0.000",
                "isLeaf": true,
                "predictedClass": "Benign",
                "children": []
              }
            ]
          },
          {
            "id": "root_C0_R_R",
            "name": "Diện tích xấu nhất (area_worst) ≤ 810.10",
            "feature": "area_worst",
            "threshold": 810.1,
            "criterion": "gini = 0.064",
            "samples": 151,
            "values": [
              5,
              146
            ],
            "isLeaf": false,
            "children": [
              {
                "id": "root_C0_R_R_L",
                "name": "Độ mịn trung bình (smoothness_mean) ≤ 0.09",
                "feature": "smoothness_mean",
                "threshold": 0.0933,
                "criterion": "gini = 0.480",
                "samples": 5,
                "values": [
                  3,
                  2
                ],
                "isLeaf": false,
                "children": [
                  {
                    "id": "root_C0_R_R_L_L",
                    "name": "Lá: Lành tính",
                    "samples": 3,
                    "values": [
                      3,
                      0
                    ],
                    "criterion": "gini = 0.000",
                    "isLeaf": true,
                    "predictedClass": "Benign",
                    "children": []
                  },
                  {
                    "id": "root_C0_R_R_L_R",
                    "name": "Lá: Ác tính",
                    "samples": 2,
                    "values": [
                      0,
                      2
                    ],
                    "criterion": "gini = 0.000",
                    "isLeaf": true,
                    "predictedClass": "Malignant",
                    "children": []
                  }
                ]
              },
              {
                "id": "root_C0_R_R_R",
                "name": "Độ lõm xấu nhất (concavity_worst) ≤ 0.20",
                "feature": "concavity_worst",
                "threshold": 0.1981,
                "criterion": "gini = 0.027",
                "samples": 146,
                "values": [
                  2,
                  144
                ],
                "isLeaf": false,
                "children": [
                  {
                    "id": "root_C0_R_R_R_L",
                    "name": "Độ nhám trung bình (texture_mean) ≤ 21.26",
                    "feature": "texture_mean",
                    "threshold": 21.26,
                    "criterion": "gini = 0.500",
                    "samples": 4,
                    "values": [
                      2,
                      2
                    ],
                    "isLeaf": false,
                    "children": [
                      {
                        "id": "root_C0_R_R_R_L_L",
                        "name": "Lá: Lành tính",
                        "samples": 2,
                        "values": [
                          2,
                          0
                        ],
                        "criterion": "gini = 0.000",
                        "isLeaf": true,
                        "predictedClass": "Benign",
                        "children": []
                      },
                      {
                        "id": "root_C0_R_R_R_L_R",
                        "name": "Lá: Ác tính",
                        "samples": 2,
                        "values": [
                          0,
                          2
                        ],
                        "criterion": "gini = 0.000",
                        "isLeaf": true,
                        "predictedClass": "Malignant",
                        "children": []
                      }
                    ]
                  },
                  {
                    "id": "root_C0_R_R_R_R",
                    "name": "Lá: Ác tính",
                    "samples": 142,
                    "values": [
                      0,
                      142
                    ],
                    "criterion": "gini = 0.000",
                    "isLeaf": true,
                    "predictedClass": "Malignant",
                    "children": []
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  "baseline": {
    "id": "root_B0",
    "name": "Chu vi xấu nhất (perimeter_worst) ≤ 112.80",
    "feature": "perimeter_worst",
    "threshold": 112.8,
    "criterion": "gini = 0.468",
    "samples": 455,
    "values": [
      285,
      170
    ],
    "isLeaf": false,
    "children": [
      {
        "id": "root_B0_L",
        "name": "Điểm lõm xấu nhất (concave_points_worst) ≤ 0.16",
        "feature": "concave_points_worst",
        "threshold": 0.1603,
        "criterion": "gini = 0.137",
        "samples": 297,
        "values": [
          275,
          22
        ],
        "isLeaf": false,
        "children": [
          {
            "id": "root_B0_L_L",
            "name": "Diện tích trung bình (area_mean) ≤ 696.25",
            "feature": "area_mean",
            "threshold": 696.25,
            "criterion": "gini = 0.081",
            "samples": 285,
            "values": [
              273,
              12
            ],
            "isLeaf": false,
            "children": [
              {
                "id": "root_B0_L_L_L",
                "name": "Độ mịn xấu nhất (smoothness_worst) ≤ 0.18",
                "feature": "smoothness_worst",
                "threshold": 0.1782,
                "criterion": "gini = 0.056",
                "samples": 279,
                "values": [
                  271,
                  8
                ],
                "isLeaf": false,
                "children": [
                  {
                    "id": "root_B0_L_L_L_L",
                    "name": "Chu vi xấu nhất (perimeter_worst) ≤ 102.40",
                    "feature": "perimeter_worst",
                    "threshold": 102.4,
                    "criterion": "gini = 0.036",
                    "samples": 274,
                    "values": [
                      269,
                      5
                    ],
                    "isLeaf": false,
                    "children": [
                      {
                        "id": "root_B0_L_L_L_L_L",
                        "name": "Sai số diện tích (area_se) ≤ 47.03",
                        "feature": "area_se",
                        "threshold": 47.035,
                        "criterion": "gini = 0.016",
                        "samples": 247,
                        "values": [
                          245,
                          2
                        ],
                        "isLeaf": false,
                        "children": [
                          {
                            "id": "root_B0_L_L_L_L_L_L",
                            "name": "Độ nhám xấu nhất (texture_worst) ≤ 33.35",
                            "feature": "texture_worst",
                            "threshold": 33.35,
                            "criterion": "gini = 0.008",
                            "samples": 243,
                            "values": [
                              242,
                              1
                            ],
                            "isLeaf": false,
                            "children": [
                              {
                                "id": "root_B0_L_L_L_L_L_L_L",
                                "name": "Lá: Lành tính",
                                "samples": 229,
                                "values": [
                                  229,
                                  0
                                ],
                                "criterion": "gini = 0.000",
                                "isLeaf": true,
                                "predictedClass": "Benign",
                                "children": []
                              },
                              {
                                "id": "root_B0_L_L_L_L_L_L_R",
                                "name": "Độ nhám trung bình (texture_mean) ≤ 23.20",
                                "feature": "texture_mean",
                                "threshold": 23.2,
                                "criterion": "gini = 0.133",
                                "samples": 14,
                                "values": [
                                  13,
                                  1
                                ],
                                "isLeaf": false,
                                "children": [
                                  {
                                    "id": "root_B0_L_L_L_L_L_L_R_L",
                                    "name": "Lá: Ác tính",
                                    "samples": 1,
                                    "values": [
                                      0,
                                      1
                                    ],
                                    "criterion": "gini = 0.000",
                                    "isLeaf": true,
                                    "predictedClass": "Malignant",
                                    "children": []
                                  },
                                  {
                                    "id": "root_B0_L_L_L_L_L_L_R_R",
                                    "name": "Lá: Lành tính",
                                    "samples": 13,
                                    "values": [
                                      13,
                                      0
                                    ],
                                    "criterion": "gini = 0.000",
                                    "isLeaf": true,
                                    "predictedClass": "Benign",
                                    "children": []
                                  }
                                ]
                              }
                            ]
                          },
                          {
                            "id": "root_B0_L_L_L_L_L_R",
                            "name": "Độ nén trung bình (compactness_mean) ≤ 0.06",
                            "feature": "compactness_mean",
                            "threshold": 0.0626,
                            "criterion": "gini = 0.375",
                            "samples": 4,
                            "values": [
                              3,
                              1
                            ],
                            "isLeaf": false,
                            "children": [
                              {
                                "id": "root_B0_L_L_L_L_L_R_L",
                                "name": "Lá: Ác tính",
                                "samples": 1,
                                "values": [
                                  0,
                                  1
                                ],
                                "criterion": "gini = 0.000",
                                "isLeaf": true,
                                "predictedClass": "Malignant",
                                "children": []
                              },
                              {
                                "id": "root_B0_L_L_L_L_L_R_R",
                                "name": "Lá: Lành tính",
                                "samples": 3,
                                "values": [
                                  3,
                                  0
                                ],
                                "criterion": "gini = 0.000",
                                "isLeaf": true,
                                "predictedClass": "Benign",
                                "children": []
                              }
                            ]
                          }
                        ]
                      },
                      {
                        "id": "root_B0_L_L_L_L_R",
                        "name": "Độ mịn xấu nhất (smoothness_worst) ≤ 0.14",
                        "feature": "smoothness_worst",
                        "threshold": 0.1363,
                        "criterion": "gini = 0.198",
                        "samples": 27,
                        "values": [
                          24,
                          3
                        ],
                        "isLeaf": false,
                        "children": [
                          {
                            "id": "root_B0_L_L_L_L_R_L",
                            "name": "Sai số chu vi (perimeter_se) ≤ 1.58",
                            "feature": "perimeter_se",
                            "threshold": 1.584,
                            "criterion": "gini = 0.077",
                            "samples": 25,
                            "values": [
                              24,
                              1
                            ],
                            "isLeaf": false,
                            "children": [
                              {
                                "id": "root_B0_L_L_L_L_R_L_L",
                                "name": "Bán kính trung bình (radius_mean) ≤ 14.04",
                                "feature": "radius_mean",
                                "threshold": 14.04,
                                "criterion": "gini = 0.500",
                                "samples": 2,
                                "values": [
                                  1,
                                  1
                                ],
                                "isLeaf": false,
                                "children": [
                                  {
                                    "id": "root_B0_L_L_L_L_R_L_L_L",
                                    "name": "Lá: Ác tính",
                                    "samples": 1,
                                    "values": [
                                      0,
                                      1
                                    ],
                                    "criterion": "gini = 0.000",
                                    "isLeaf": true,
                                    "predictedClass": "Malignant",
                                    "children": []
                                  },
                                  {
                                    "id": "root_B0_L_L_L_L_R_L_L_R",
                                    "name": "Lá: Lành tính",
                                    "samples": 1,
                                    "values": [
                                      1,
                                      0
                                    ],
                                    "criterion": "gini = 0.000",
                                    "isLeaf": true,
                                    "predictedClass": "Benign",
                                    "children": []
                                  }
                                ]
                              },
                              {
                                "id": "root_B0_L_L_L_L_R_L_R",
                                "name": "Lá: Lành tính",
                                "samples": 23,
                                "values": [
                                  23,
                                  0
                                ],
                                "criterion": "gini = 0.000",
                                "isLeaf": true,
                                "predictedClass": "Benign",
                                "children": []
                              }
                            ]
                          },
                          {
                            "id": "root_B0_L_L_L_L_R_R",
                            "name": "Lá: Ác tính",
                            "samples": 2,
                            "values": [
                              0,
                              2
                            ],
                            "criterion": "gini = 0.000",
                            "isLeaf": true,
                            "predictedClass": "Malignant",
                            "children": []
                          }
                        ]
                      }
                    ]
                  },
                  {
                    "id": "root_B0_L_L_L_R",
                    "name": "Bán kính trung bình (radius_mean) ≤ 10.12",
                    "feature": "radius_mean",
                    "threshold": 10.1225,
                    "criterion": "gini = 0.480",
                    "samples": 5,
                    "values": [
                      2,
                      3
                    ],
                    "isLeaf": false,
                    "children": [
                      {
                        "id": "root_B0_L_L_L_R_L",
                        "name": "Lá: Lành tính",
                        "samples": 2,
                        "values": [
                          2,
                          0
                        ],
                        "criterion": "gini = 0.000",
                        "isLeaf": true,
                        "predictedClass": "Benign",
                        "children": []
                      },
                      {
                        "id": "root_B0_L_L_L_R_R",
                        "name": "Lá: Ác tính",
                        "samples": 3,
                        "values": [
                          0,
                          3
                        ],
                        "criterion": "gini = 0.000",
                        "isLeaf": true,
                        "predictedClass": "Malignant",
                        "children": []
                      }
                    ]
                  }
                ]
              },
              {
                "id": "root_B0_L_L_R",
                "name": "Độ nhám trung bình (texture_mean) ≤ 19.23",
                "feature": "texture_mean",
                "threshold": 19.23,
                "criterion": "gini = 0.444",
                "samples": 6,
                "values": [
                  2,
                  4
                ],
                "isLeaf": false,
                "children": [
                  {
                    "id": "root_B0_L_L_R_L",
                    "name": "Lá: Lành tính",
                    "samples": 2,
                    "values": [
                      2,
                      0
                    ],
                    "criterion": "gini = 0.000",
                    "isLeaf": true,
                    "predictedClass": "Benign",
                    "children": []
                  },
                  {
                    "id": "root_B0_L_L_R_R",
                    "name": "Lá: Ác tính",
                    "samples": 4,
                    "values": [
                      0,
                      4
                    ],
                    "criterion": "gini = 0.000",
                    "isLeaf": true,
                    "predictedClass": "Malignant",
                    "children": []
                  }
                ]
              }
            ]
          },
          {
            "id": "root_B0_L_R",
            "name": "Độ nhám xấu nhất (texture_worst) ≤ 24.79",
            "feature": "texture_worst",
            "threshold": 24.785,
            "criterion": "gini = 0.278",
            "samples": 12,
            "values": [
              2,
              10
            ],
            "isLeaf": false,
            "children": [
              {
                "id": "root_B0_L_R_L",
                "name": "Độ nhám trung bình (texture_mean) ≤ 15.71",
                "feature": "texture_mean",
                "threshold": 15.71,
                "criterion": "gini = 0.444",
                "samples": 3,
                "values": [
                  2,
                  1
                ],
                "isLeaf": false,
                "children": [
                  {
                    "id": "root_B0_L_R_L_L",
                    "name": "Lá: Ác tính",
                    "samples": 1,
                    "values": [
                      0,
                      1
                    ],
                    "criterion": "gini = 0.000",
                    "isLeaf": true,
                    "predictedClass": "Malignant",
                    "children": []
                  },
                  {
                    "id": "root_B0_L_R_L_R",
                    "name": "Lá: Lành tính",
                    "samples": 2,
                    "values": [
                      2,
                      0
                    ],
                    "criterion": "gini = 0.000",
                    "isLeaf": true,
                    "predictedClass": "Benign",
                    "children": []
                  }
                ]
              },
              {
                "id": "root_B0_L_R_R",
                "name": "Lá: Ác tính",
                "samples": 9,
                "values": [
                  0,
                  9
                ],
                "criterion": "gini = 0.000",
                "isLeaf": true,
                "predictedClass": "Malignant",
                "children": []
              }
            ]
          }
        ]
      },
      {
        "id": "root_B0_R",
        "name": "Độ nhám trung bình (texture_mean) ≤ 14.96",
        "feature": "texture_mean",
        "threshold": 14.955,
        "criterion": "gini = 0.119",
        "samples": 158,
        "values": [
          10,
          148
        ],
        "isLeaf": false,
        "children": [
          {
            "id": "root_B0_R_L",
            "name": "Độ nhám trung bình (texture_mean) ≤ 12.40",
            "feature": "texture_mean",
            "threshold": 12.4,
            "criterion": "gini = 0.408",
            "samples": 7,
            "values": [
              5,
              2
            ],
            "isLeaf": false,
            "children": [
              {
                "id": "root_B0_R_L_L",
                "name": "Lá: Ác tính",
                "samples": 2,
                "values": [
                  0,
                  2
                ],
                "criterion": "gini = 0.000",
                "isLeaf": true,
                "predictedClass": "Malignant",
                "children": []
              },
              {
                "id": "root_B0_R_L_R",
                "name": "Lá: Lành tính",
                "samples": 5,
                "values": [
                  5,
                  0
                ],
                "criterion": "gini = 0.000",
                "isLeaf": true,
                "predictedClass": "Benign",
                "children": []
              }
            ]
          },
          {
            "id": "root_B0_R_R",
            "name": "Diện tích xấu nhất (area_worst) ≤ 810.10",
            "feature": "area_worst",
            "threshold": 810.1,
            "criterion": "gini = 0.064",
            "samples": 151,
            "values": [
              5,
              146
            ],
            "isLeaf": false,
            "children": [
              {
                "id": "root_B0_R_R_L",
                "name": "Độ mịn trung bình (smoothness_mean) ≤ 0.09",
                "feature": "smoothness_mean",
                "threshold": 0.0933,
                "criterion": "gini = 0.480",
                "samples": 5,
                "values": [
                  3,
                  2
                ],
                "isLeaf": false,
                "children": [
                  {
                    "id": "root_B0_R_R_L_L",
                    "name": "Lá: Lành tính",
                    "samples": 3,
                    "values": [
                      3,
                      0
                    ],
                    "criterion": "gini = 0.000",
                    "isLeaf": true,
                    "predictedClass": "Benign",
                    "children": []
                  },
                  {
                    "id": "root_B0_R_R_L_R",
                    "name": "Lá: Ác tính",
                    "samples": 2,
                    "values": [
                      0,
                      2
                    ],
                    "criterion": "gini = 0.000",
                    "isLeaf": true,
                    "predictedClass": "Malignant",
                    "children": []
                  }
                ]
              },
              {
                "id": "root_B0_R_R_R",
                "name": "Độ mịn xấu nhất (smoothness_worst) ≤ 0.09",
                "feature": "smoothness_worst",
                "threshold": 0.088,
                "criterion": "gini = 0.027",
                "samples": 146,
                "values": [
                  2,
                  144
                ],
                "isLeaf": false,
                "children": [
                  {
                    "id": "root_B0_R_R_R_L",
                    "name": "Lá: Lành tính",
                    "samples": 1,
                    "values": [
                      1,
                      0
                    ],
                    "criterion": "gini = 0.000",
                    "isLeaf": true,
                    "predictedClass": "Benign",
                    "children": []
                  },
                  {
                    "id": "root_B0_R_R_R_R",
                    "name": "Độ lõm xấu nhất (concavity_worst) ≤ 0.19",
                    "feature": "concavity_worst",
                    "threshold": 0.1871,
                    "criterion": "gini = 0.014",
                    "samples": 145,
                    "values": [
                      1,
                      144
                    ],
                    "isLeaf": false,
                    "children": [
                      {
                        "id": "root_B0_R_R_R_R_L",
                        "name": "Độ nhám trung bình (texture_mean) ≤ 20.67",
                        "feature": "texture_mean",
                        "threshold": 20.675,
                        "criterion": "gini = 0.444",
                        "samples": 3,
                        "values": [
                          1,
                          2
                        ],
                        "isLeaf": false,
                        "children": [
                          {
                            "id": "root_B0_R_R_R_R_L_L",
                            "name": "Lá: Lành tính",
                            "samples": 1,
                            "values": [
                              1,
                              0
                            ],
                            "criterion": "gini = 0.000",
                            "isLeaf": true,
                            "predictedClass": "Benign",
                            "children": []
                          },
                          {
                            "id": "root_B0_R_R_R_R_L_R",
                            "name": "Lá: Ác tính",
                            "samples": 2,
                            "values": [
                              0,
                              2
                            ],
                            "criterion": "gini = 0.000",
                            "isLeaf": true,
                            "predictedClass": "Malignant",
                            "children": []
                          }
                        ]
                      },
                      {
                        "id": "root_B0_R_R_R_R_R",
                        "name": "Lá: Ác tính",
                        "samples": 142,
                        "values": [
                          0,
                          142
                        ],
                        "criterion": "gini = 0.000",
                        "isLeaf": true,
                        "predictedClass": "Malignant",
                        "children": []
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  "depth_tune": {
    "id": "root_I1",
    "name": "Chu vi xấu nhất (perimeter_worst) ≤ 112.80",
    "feature": "perimeter_worst",
    "threshold": 112.8,
    "criterion": "gini = 0.468",
    "samples": 455,
    "values": [
      285,
      170
    ],
    "isLeaf": false,
    "children": [
      {
        "id": "root_I1_L",
        "name": "Điểm lõm xấu nhất (concave_points_worst) ≤ 0.16",
        "feature": "concave_points_worst",
        "threshold": 0.1603,
        "criterion": "gini = 0.137",
        "samples": 297,
        "values": [
          275,
          22
        ],
        "isLeaf": false,
        "children": [
          {
            "id": "root_I1_L_L",
            "name": "Diện tích trung bình (area_mean) ≤ 696.25",
            "feature": "area_mean",
            "threshold": 696.25,
            "criterion": "gini = 0.081",
            "samples": 285,
            "values": [
              273,
              12
            ],
            "isLeaf": false,
            "children": [
              {
                "id": "root_I1_L_L_L",
                "name": "Độ mịn xấu nhất (smoothness_worst) ≤ 0.18",
                "feature": "smoothness_worst",
                "threshold": 0.1782,
                "criterion": "gini = 0.056",
                "samples": 279,
                "values": [
                  271,
                  8
                ],
                "isLeaf": false,
                "children": [
                  {
                    "id": "root_I1_L_L_L_L",
                    "name": "Chu vi xấu nhất (perimeter_worst) ≤ 102.40",
                    "feature": "perimeter_worst",
                    "threshold": 102.4,
                    "criterion": "gini = 0.036",
                    "samples": 274,
                    "values": [
                      269,
                      5
                    ],
                    "isLeaf": false,
                    "children": [
                      {
                        "id": "root_I1_L_L_L_L_L",
                        "name": "Sai số diện tích (area_se) ≤ 47.03",
                        "feature": "area_se",
                        "threshold": 47.035,
                        "criterion": "gini = 0.016",
                        "samples": 247,
                        "values": [
                          245,
                          2
                        ],
                        "isLeaf": false,
                        "children": [
                          {
                            "id": "root_I1_L_L_L_L_L_L",
                            "name": "Độ nhám xấu nhất (texture_worst) ≤ 33.35",
                            "feature": "texture_worst",
                            "threshold": 33.35,
                            "criterion": "gini = 0.008",
                            "samples": 243,
                            "values": [
                              242,
                              1
                            ],
                            "isLeaf": false,
                            "children": [
                              {
                                "id": "root_I1_L_L_L_L_L_L_L",
                                "name": "Lá: Lành tính",
                                "samples": 229,
                                "values": [
                                  229,
                                  0
                                ],
                                "criterion": "gini = 0.000",
                                "isLeaf": true,
                                "predictedClass": "Benign",
                                "children": []
                              },
                              {
                                "id": "root_I1_L_L_L_L_L_L_R",
                                "name": "Độ nhám trung bình (texture_mean) ≤ 23.20",
                                "feature": "texture_mean",
                                "threshold": 23.2,
                                "criterion": "gini = 0.133",
                                "samples": 14,
                                "values": [
                                  13,
                                  1
                                ],
                                "isLeaf": false,
                                "children": [
                                  {
                                    "id": "root_I1_L_L_L_L_L_L_R_L",
                                    "name": "Lá: Ác tính",
                                    "samples": 1,
                                    "values": [
                                      0,
                                      1
                                    ],
                                    "criterion": "gini = 0.000",
                                    "isLeaf": true,
                                    "predictedClass": "Malignant",
                                    "children": []
                                  },
                                  {
                                    "id": "root_I1_L_L_L_L_L_L_R_R",
                                    "name": "Lá: Lành tính",
                                    "samples": 13,
                                    "values": [
                                      13,
                                      0
                                    ],
                                    "criterion": "gini = 0.000",
                                    "isLeaf": true,
                                    "predictedClass": "Benign",
                                    "children": []
                                  }
                                ]
                              }
                            ]
                          },
                          {
                            "id": "root_I1_L_L_L_L_L_R",
                            "name": "Độ nén trung bình (compactness_mean) ≤ 0.06",
                            "feature": "compactness_mean",
                            "threshold": 0.0626,
                            "criterion": "gini = 0.375",
                            "samples": 4,
                            "values": [
                              3,
                              1
                            ],
                            "isLeaf": false,
                            "children": [
                              {
                                "id": "root_I1_L_L_L_L_L_R_L",
                                "name": "Lá: Ác tính",
                                "samples": 1,
                                "values": [
                                  0,
                                  1
                                ],
                                "criterion": "gini = 0.000",
                                "isLeaf": true,
                                "predictedClass": "Malignant",
                                "children": []
                              },
                              {
                                "id": "root_I1_L_L_L_L_L_R_R",
                                "name": "Lá: Lành tính",
                                "samples": 3,
                                "values": [
                                  3,
                                  0
                                ],
                                "criterion": "gini = 0.000",
                                "isLeaf": true,
                                "predictedClass": "Benign",
                                "children": []
                              }
                            ]
                          }
                        ]
                      },
                      {
                        "id": "root_I1_L_L_L_L_R",
                        "name": "Độ mịn xấu nhất (smoothness_worst) ≤ 0.14",
                        "feature": "smoothness_worst",
                        "threshold": 0.1363,
                        "criterion": "gini = 0.198",
                        "samples": 27,
                        "values": [
                          24,
                          3
                        ],
                        "isLeaf": false,
                        "children": [
                          {
                            "id": "root_I1_L_L_L_L_R_L",
                            "name": "Sai số chu vi (perimeter_se) ≤ 1.58",
                            "feature": "perimeter_se",
                            "threshold": 1.584,
                            "criterion": "gini = 0.077",
                            "samples": 25,
                            "values": [
                              24,
                              1
                            ],
                            "isLeaf": false,
                            "children": [
                              {
                                "id": "root_I1_L_L_L_L_R_L_L",
                                "name": "Bán kính trung bình (radius_mean) ≤ 14.04",
                                "feature": "radius_mean",
                                "threshold": 14.04,
                                "criterion": "gini = 0.500",
                                "samples": 2,
                                "values": [
                                  1,
                                  1
                                ],
                                "isLeaf": false,
                                "children": [
                                  {
                                    "id": "root_I1_L_L_L_L_R_L_L_L",
                                    "name": "Lá: Ác tính",
                                    "samples": 1,
                                    "values": [
                                      0,
                                      1
                                    ],
                                    "criterion": "gini = 0.000",
                                    "isLeaf": true,
                                    "predictedClass": "Malignant",
                                    "children": []
                                  },
                                  {
                                    "id": "root_I1_L_L_L_L_R_L_L_R",
                                    "name": "Lá: Lành tính",
                                    "samples": 1,
                                    "values": [
                                      1,
                                      0
                                    ],
                                    "criterion": "gini = 0.000",
                                    "isLeaf": true,
                                    "predictedClass": "Benign",
                                    "children": []
                                  }
                                ]
                              },
                              {
                                "id": "root_I1_L_L_L_L_R_L_R",
                                "name": "Lá: Lành tính",
                                "samples": 23,
                                "values": [
                                  23,
                                  0
                                ],
                                "criterion": "gini = 0.000",
                                "isLeaf": true,
                                "predictedClass": "Benign",
                                "children": []
                              }
                            ]
                          },
                          {
                            "id": "root_I1_L_L_L_L_R_R",
                            "name": "Lá: Ác tính",
                            "samples": 2,
                            "values": [
                              0,
                              2
                            ],
                            "criterion": "gini = 0.000",
                            "isLeaf": true,
                            "predictedClass": "Malignant",
                            "children": []
                          }
                        ]
                      }
                    ]
                  },
                  {
                    "id": "root_I1_L_L_L_R",
                    "name": "Bán kính trung bình (radius_mean) ≤ 10.12",
                    "feature": "radius_mean",
                    "threshold": 10.1225,
                    "criterion": "gini = 0.480",
                    "samples": 5,
                    "values": [
                      2,
                      3
                    ],
                    "isLeaf": false,
                    "children": [
                      {
                        "id": "root_I1_L_L_L_R_L",
                        "name": "Lá: Lành tính",
                        "samples": 2,
                        "values": [
                          2,
                          0
                        ],
                        "criterion": "gini = 0.000",
                        "isLeaf": true,
                        "predictedClass": "Benign",
                        "children": []
                      },
                      {
                        "id": "root_I1_L_L_L_R_R",
                        "name": "Lá: Ác tính",
                        "samples": 3,
                        "values": [
                          0,
                          3
                        ],
                        "criterion": "gini = 0.000",
                        "isLeaf": true,
                        "predictedClass": "Malignant",
                        "children": []
                      }
                    ]
                  }
                ]
              },
              {
                "id": "root_I1_L_L_R",
                "name": "Độ nhám trung bình (texture_mean) ≤ 19.23",
                "feature": "texture_mean",
                "threshold": 19.23,
                "criterion": "gini = 0.444",
                "samples": 6,
                "values": [
                  2,
                  4
                ],
                "isLeaf": false,
                "children": [
                  {
                    "id": "root_I1_L_L_R_L",
                    "name": "Lá: Lành tính",
                    "samples": 2,
                    "values": [
                      2,
                      0
                    ],
                    "criterion": "gini = 0.000",
                    "isLeaf": true,
                    "predictedClass": "Benign",
                    "children": []
                  },
                  {
                    "id": "root_I1_L_L_R_R",
                    "name": "Lá: Ác tính",
                    "samples": 4,
                    "values": [
                      0,
                      4
                    ],
                    "criterion": "gini = 0.000",
                    "isLeaf": true,
                    "predictedClass": "Malignant",
                    "children": []
                  }
                ]
              }
            ]
          },
          {
            "id": "root_I1_L_R",
            "name": "Độ nhám xấu nhất (texture_worst) ≤ 24.79",
            "feature": "texture_worst",
            "threshold": 24.785,
            "criterion": "gini = 0.278",
            "samples": 12,
            "values": [
              2,
              10
            ],
            "isLeaf": false,
            "children": [
              {
                "id": "root_I1_L_R_L",
                "name": "Độ nhám trung bình (texture_mean) ≤ 15.71",
                "feature": "texture_mean",
                "threshold": 15.71,
                "criterion": "gini = 0.444",
                "samples": 3,
                "values": [
                  2,
                  1
                ],
                "isLeaf": false,
                "children": [
                  {
                    "id": "root_I1_L_R_L_L",
                    "name": "Lá: Ác tính",
                    "samples": 1,
                    "values": [
                      0,
                      1
                    ],
                    "criterion": "gini = 0.000",
                    "isLeaf": true,
                    "predictedClass": "Malignant",
                    "children": []
                  },
                  {
                    "id": "root_I1_L_R_L_R",
                    "name": "Lá: Lành tính",
                    "samples": 2,
                    "values": [
                      2,
                      0
                    ],
                    "criterion": "gini = 0.000",
                    "isLeaf": true,
                    "predictedClass": "Benign",
                    "children": []
                  }
                ]
              },
              {
                "id": "root_I1_L_R_R",
                "name": "Lá: Ác tính",
                "samples": 9,
                "values": [
                  0,
                  9
                ],
                "criterion": "gini = 0.000",
                "isLeaf": true,
                "predictedClass": "Malignant",
                "children": []
              }
            ]
          }
        ]
      },
      {
        "id": "root_I1_R",
        "name": "Độ nhám trung bình (texture_mean) ≤ 14.96",
        "feature": "texture_mean",
        "threshold": 14.955,
        "criterion": "gini = 0.119",
        "samples": 158,
        "values": [
          10,
          148
        ],
        "isLeaf": false,
        "children": [
          {
            "id": "root_I1_R_L",
            "name": "Độ nhám trung bình (texture_mean) ≤ 12.40",
            "feature": "texture_mean",
            "threshold": 12.4,
            "criterion": "gini = 0.408",
            "samples": 7,
            "values": [
              5,
              2
            ],
            "isLeaf": false,
            "children": [
              {
                "id": "root_I1_R_L_L",
                "name": "Lá: Ác tính",
                "samples": 2,
                "values": [
                  0,
                  2
                ],
                "criterion": "gini = 0.000",
                "isLeaf": true,
                "predictedClass": "Malignant",
                "children": []
              },
              {
                "id": "root_I1_R_L_R",
                "name": "Lá: Lành tính",
                "samples": 5,
                "values": [
                  5,
                  0
                ],
                "criterion": "gini = 0.000",
                "isLeaf": true,
                "predictedClass": "Benign",
                "children": []
              }
            ]
          },
          {
            "id": "root_I1_R_R",
            "name": "Diện tích xấu nhất (area_worst) ≤ 810.10",
            "feature": "area_worst",
            "threshold": 810.1,
            "criterion": "gini = 0.064",
            "samples": 151,
            "values": [
              5,
              146
            ],
            "isLeaf": false,
            "children": [
              {
                "id": "root_I1_R_R_L",
                "name": "Độ mịn trung bình (smoothness_mean) ≤ 0.09",
                "feature": "smoothness_mean",
                "threshold": 0.0933,
                "criterion": "gini = 0.480",
                "samples": 5,
                "values": [
                  3,
                  2
                ],
                "isLeaf": false,
                "children": [
                  {
                    "id": "root_I1_R_R_L_L",
                    "name": "Lá: Lành tính",
                    "samples": 3,
                    "values": [
                      3,
                      0
                    ],
                    "criterion": "gini = 0.000",
                    "isLeaf": true,
                    "predictedClass": "Benign",
                    "children": []
                  },
                  {
                    "id": "root_I1_R_R_L_R",
                    "name": "Lá: Ác tính",
                    "samples": 2,
                    "values": [
                      0,
                      2
                    ],
                    "criterion": "gini = 0.000",
                    "isLeaf": true,
                    "predictedClass": "Malignant",
                    "children": []
                  }
                ]
              },
              {
                "id": "root_I1_R_R_R",
                "name": "Độ mịn xấu nhất (smoothness_worst) ≤ 0.09",
                "feature": "smoothness_worst",
                "threshold": 0.088,
                "criterion": "gini = 0.027",
                "samples": 146,
                "values": [
                  2,
                  144
                ],
                "isLeaf": false,
                "children": [
                  {
                    "id": "root_I1_R_R_R_L",
                    "name": "Lá: Lành tính",
                    "samples": 1,
                    "values": [
                      1,
                      0
                    ],
                    "criterion": "gini = 0.000",
                    "isLeaf": true,
                    "predictedClass": "Benign",
                    "children": []
                  },
                  {
                    "id": "root_I1_R_R_R_R",
                    "name": "Độ lõm xấu nhất (concavity_worst) ≤ 0.19",
                    "feature": "concavity_worst",
                    "threshold": 0.1871,
                    "criterion": "gini = 0.014",
                    "samples": 145,
                    "values": [
                      1,
                      144
                    ],
                    "isLeaf": false,
                    "children": [
                      {
                        "id": "root_I1_R_R_R_R_L",
                        "name": "Độ nhám trung bình (texture_mean) ≤ 20.67",
                        "feature": "texture_mean",
                        "threshold": 20.675,
                        "criterion": "gini = 0.444",
                        "samples": 3,
                        "values": [
                          1,
                          2
                        ],
                        "isLeaf": false,
                        "children": [
                          {
                            "id": "root_I1_R_R_R_R_L_L",
                            "name": "Lá: Lành tính",
                            "samples": 1,
                            "values": [
                              1,
                              0
                            ],
                            "criterion": "gini = 0.000",
                            "isLeaf": true,
                            "predictedClass": "Benign",
                            "children": []
                          },
                          {
                            "id": "root_I1_R_R_R_R_L_R",
                            "name": "Lá: Ác tính",
                            "samples": 2,
                            "values": [
                              0,
                              2
                            ],
                            "criterion": "gini = 0.000",
                            "isLeaf": true,
                            "predictedClass": "Malignant",
                            "children": []
                          }
                        ]
                      },
                      {
                        "id": "root_I1_R_R_R_R_R",
                        "name": "Lá: Ác tính",
                        "samples": 142,
                        "values": [
                          0,
                          142
                        ],
                        "criterion": "gini = 0.000",
                        "isLeaf": true,
                        "predictedClass": "Malignant",
                        "children": []
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  "entropy": {
    "id": "root_I2",
    "name": "Chu vi xấu nhất (perimeter_worst) ≤ 114.45",
    "feature": "perimeter_worst",
    "threshold": 114.45,
    "criterion": "entropy = 0.953",
    "samples": 455,
    "values": [
      285,
      170
    ],
    "isLeaf": false,
    "children": [
      {
        "id": "root_I2_L",
        "name": "Điểm lõm xấu nhất (concave_points_worst) ≤ 0.11",
        "feature": "concave_points_worst",
        "threshold": 0.111,
        "criterion": "entropy = 0.439",
        "samples": 308,
        "values": [
          280,
          28
        ],
        "isLeaf": false,
        "children": [
          {
            "id": "root_I2_L_L",
            "name": "Sai số diện tích (area_se) ≤ 45.17",
            "feature": "area_se",
            "threshold": 45.17,
            "criterion": "entropy = 0.120",
            "samples": 245,
            "values": [
              241,
              4
            ],
            "isLeaf": false,
            "children": [
              {
                "id": "root_I2_L_L_L",
                "name": "Độ nhám xấu nhất (texture_worst) ≤ 33.35",
                "feature": "texture_worst",
                "threshold": 33.35,
                "criterion": "entropy = 0.039",
                "samples": 238,
                "values": [
                  237,
                  1
                ],
                "isLeaf": false,
                "children": [
                  {
                    "id": "root_I2_L_L_L_L",
                    "name": "Lá: Lành tính",
                    "samples": 223,
                    "values": [
                      223,
                      0
                    ],
                    "criterion": "entropy = -0.000",
                    "isLeaf": true,
                    "predictedClass": "Benign",
                    "children": []
                  },
                  {
                    "id": "root_I2_L_L_L_R",
                    "name": "Độ nhám trung bình (texture_mean) ≤ 23.20",
                    "feature": "texture_mean",
                    "threshold": 23.2,
                    "criterion": "entropy = 0.353",
                    "samples": 15,
                    "values": [
                      14,
                      1
                    ],
                    "isLeaf": false,
                    "children": [
                      {
                        "id": "root_I2_L_L_L_R_L",
                        "name": "Lá: Ác tính",
                        "samples": 1,
                        "values": [
                          0,
                          1
                        ],
                        "criterion": "entropy = -0.000",
                        "isLeaf": true,
                        "predictedClass": "Malignant",
                        "children": []
                      },
                      {
                        "id": "root_I2_L_L_L_R_R",
                        "name": "Lá: Lành tính",
                        "samples": 14,
                        "values": [
                          14,
                          0
                        ],
                        "criterion": "entropy = -0.000",
                        "isLeaf": true,
                        "predictedClass": "Benign",
                        "children": []
                      }
                    ]
                  }
                ]
              },
              {
                "id": "root_I2_L_L_R",
                "name": "Độ nén trung bình (compactness_mean) ≤ 0.06",
                "feature": "compactness_mean",
                "threshold": 0.0626,
                "criterion": "entropy = 0.985",
                "samples": 7,
                "values": [
                  4,
                  3
                ],
                "isLeaf": false,
                "children": [
                  {
                    "id": "root_I2_L_L_R_L",
                    "name": "Lá: Ác tính",
                    "samples": 3,
                    "values": [
                      0,
                      3
                    ],
                    "criterion": "entropy = -0.000",
                    "isLeaf": true,
                    "predictedClass": "Malignant",
                    "children": []
                  },
                  {
                    "id": "root_I2_L_L_R_R",
                    "name": "Lá: Lành tính",
                    "samples": 4,
                    "values": [
                      4,
                      0
                    ],
                    "criterion": "entropy = -0.000",
                    "isLeaf": true,
                    "predictedClass": "Benign",
                    "children": []
                  }
                ]
              }
            ]
          },
          {
            "id": "root_I2_L_R",
            "name": "Độ nhám xấu nhất (texture_worst) ≤ 25.73",
            "feature": "texture_worst",
            "threshold": 25.735,
            "criterion": "entropy = 0.959",
            "samples": 63,
            "values": [
              39,
              24
            ],
            "isLeaf": false,
            "children": [
              {
                "id": "root_I2_L_R_L",
                "name": "Sai số diện tích (area_se) ≤ 33.40",
                "feature": "area_se",
                "threshold": 33.4,
                "criterion": "entropy = 0.371",
                "samples": 28,
                "values": [
                  26,
                  2
                ],
                "isLeaf": false,
                "children": [
                  {
                    "id": "root_I2_L_R_L_L",
                    "name": "Lá: Lành tính",
                    "samples": 24,
                    "values": [
                      24,
                      0
                    ],
                    "criterion": "entropy = -0.000",
                    "isLeaf": true,
                    "predictedClass": "Benign",
                    "children": []
                  },
                  {
                    "id": "root_I2_L_R_L_R",
                    "name": "Độ nhám trung bình (texture_mean) ≤ 15.45",
                    "feature": "texture_mean",
                    "threshold": 15.45,
                    "criterion": "entropy = 1.000",
                    "samples": 4,
                    "values": [
                      2,
                      2
                    ],
                    "isLeaf": false,
                    "children": [
                      {
                        "id": "root_I2_L_R_L_R_L",
                        "name": "Lá: Lành tính",
                        "samples": 2,
                        "values": [
                          2,
                          0
                        ],
                        "criterion": "entropy = -0.000",
                        "isLeaf": true,
                        "predictedClass": "Benign",
                        "children": []
                      },
                      {
                        "id": "root_I2_L_R_L_R_R",
                        "name": "Lá: Ác tính",
                        "samples": 2,
                        "values": [
                          0,
                          2
                        ],
                        "criterion": "entropy = -0.000",
                        "isLeaf": true,
                        "predictedClass": "Malignant",
                        "children": []
                      }
                    ]
                  }
                ]
              },
              {
                "id": "root_I2_L_R_R",
                "name": "Điểm lõm trung bình (concave_points_mean) ≤ 0.05",
                "feature": "concave_points_mean",
                "threshold": 0.0549,
                "criterion": "entropy = 0.952",
                "samples": 35,
                "values": [
                  13,
                  22
                ],
                "isLeaf": false,
                "children": [
                  {
                    "id": "root_I2_L_R_R_L",
                    "name": "Bán kính xấu nhất (radius_worst) ≤ 15.40",
                    "feature": "radius_worst",
                    "threshold": 15.4,
                    "criterion": "entropy = 0.934",
                    "samples": 20,
                    "values": [
                      13,
                      7
                    ],
                    "isLeaf": false,
                    "children": [
                      {
                        "id": "root_I2_L_R_R_L_L",
                        "name": "Lá: Lành tính",
                        "samples": 9,
                        "values": [
                          9,
                          0
                        ],
                        "criterion": "entropy = -0.000",
                        "isLeaf": true,
                        "predictedClass": "Benign",
                        "children": []
                      },
                      {
                        "id": "root_I2_L_R_R_L_R",
                        "name": "Độ mịn trung bình (smoothness_mean) ≤ 0.09",
                        "feature": "smoothness_mean",
                        "threshold": 0.0902,
                        "criterion": "entropy = 0.946",
                        "samples": 11,
                        "values": [
                          4,
                          7
                        ],
                        "isLeaf": false,
                        "children": [
                          {
                            "id": "root_I2_L_R_R_L_R_L",
                            "name": "Độ mịn trung bình (smoothness_mean) ≤ 0.08",
                            "feature": "smoothness_mean",
                            "threshold": 0.0846,
                            "criterion": "entropy = 0.918",
                            "samples": 6,
                            "values": [
                              4,
                              2
                            ],
                            "isLeaf": false,
                            "children": [
                              {
                                "id": "root_I2_L_R_R_L_R_L_L",
                                "name": "Lá: Ác tính",
                                "samples": 2,
                                "values": [
                                  0,
                                  2
                                ],
                                "criterion": "entropy = -0.000",
                                "isLeaf": true,
                                "predictedClass": "Malignant",
                                "children": []
                              },
                              {
                                "id": "root_I2_L_R_R_L_R_L_R",
                                "name": "Lá: Lành tính",
                                "samples": 4,
                                "values": [
                                  4,
                                  0
                                ],
                                "criterion": "entropy = -0.000",
                                "isLeaf": true,
                                "predictedClass": "Benign",
                                "children": []
                              }
                            ]
                          },
                          {
                            "id": "root_I2_L_R_R_L_R_R",
                            "name": "Lá: Ác tính",
                            "samples": 5,
                            "values": [
                              0,
                              5
                            ],
                            "criterion": "entropy = -0.000",
                            "isLeaf": true,
                            "predictedClass": "Malignant",
                            "children": []
                          }
                        ]
                      }
                    ]
                  },
                  {
                    "id": "root_I2_L_R_R_R",
                    "name": "Lá: Ác tính",
                    "samples": 15,
                    "values": [
                      0,
                      15
                    ],
                    "criterion": "entropy = -0.000",
                    "isLeaf": true,
                    "predictedClass": "Malignant",
                    "children": []
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "root_I2_R",
        "name": "Điểm lõm trung bình (concave_points_mean) ≤ 0.05",
        "feature": "concave_points_mean",
        "threshold": 0.0501,
        "criterion": "entropy = 0.214",
        "samples": 147,
        "values": [
          5,
          142
        ],
        "isLeaf": false,
        "children": [
          {
            "id": "root_I2_R_L",
            "name": "Độ nhám xấu nhất (texture_worst) ≤ 28.97",
            "feature": "texture_worst",
            "threshold": 28.97,
            "criterion": "entropy = 0.980",
            "samples": 12,
            "values": [
              5,
              7
            ],
            "isLeaf": false,
            "children": [
              {
                "id": "root_I2_R_L_L",
                "name": "Độ nhám trung bình (texture_mean) ≤ 20.16",
                "feature": "texture_mean",
                "threshold": 20.165,
                "criterion": "entropy = 0.650",
                "samples": 6,
                "values": [
                  5,
                  1
                ],
                "isLeaf": false,
                "children": [
                  {
                    "id": "root_I2_R_L_L_L",
                    "name": "Lá: Lành tính",
                    "samples": 5,
                    "values": [
                      5,
                      0
                    ],
                    "criterion": "entropy = -0.000",
                    "isLeaf": true,
                    "predictedClass": "Benign",
                    "children": []
                  },
                  {
                    "id": "root_I2_R_L_L_R",
                    "name": "Lá: Ác tính",
                    "samples": 1,
                    "values": [
                      0,
                      1
                    ],
                    "criterion": "entropy = -0.000",
                    "isLeaf": true,
                    "predictedClass": "Malignant",
                    "children": []
                  }
                ]
              },
              {
                "id": "root_I2_R_L_R",
                "name": "Lá: Ác tính",
                "samples": 6,
                "values": [
                  0,
                  6
                ],
                "criterion": "entropy = -0.000",
                "isLeaf": true,
                "predictedClass": "Malignant",
                "children": []
              }
            ]
          },
          {
            "id": "root_I2_R_R",
            "name": "Lá: Ác tính",
            "samples": 135,
            "values": [
              0,
              135
            ],
            "criterion": "entropy = -0.000",
            "isLeaf": true,
            "predictedClass": "Malignant",
            "children": []
          }
        ]
      }
    ]
  }
};

export const DEFAULT_TREE_STRUCTURE: TreeNodeData = MODEL_TREE_STRUCTURES['I3'];
