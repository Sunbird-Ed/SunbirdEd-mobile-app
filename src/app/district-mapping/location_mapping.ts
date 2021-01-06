export const locationMapping = [
    {
        "code": "name",
        "type": "input",
        "templateOptions": {
            "placeHolder": "Enter Name",
            "disabled": true,
            "multiple": false
        }
    },
    {
        "code": "persona",
        "type": "nested_select",
        "templateOptions": {
            "placeHolder": "Select Persona",
            "multiple": false,
            "options": [
                {
                    "label": "Administrator",
                    "value": "administrator"
                },
                {
                    "label": "Teacher",
                    "value": "teacher"
                },
                {
                    "label": "Student",
                    "value": "student"
                },
                {
                    "label": "Other",
                    "value": "other"
                },
            ]
        },
        "validations": [
            {
                "type": "required"
            }
        ],
        "children": {
            "administrator": [
                {
                    "code": "state",
                    "type": "select",
                    "templateOptions": {
                        "placeHolder": "Select State",
                        "multiple": false,
                        "dataSrc": {
                            "marker": "STATE_LOCATION_LIST"
                        }
                    },
                    "validations": [
                        {
                            "type": "required"
                        }
                    ]
                },
                {
                    "code": "subPersona",
                    "type": "select",
                    "context": "state",
                    "default": null,
                    "templateOptions": {
                        "placeHolder": "Select Subpersona",
                        "multiple": false,
                        "dataSrc": {
                            "marker": "SUBPERSONA_LIST"
                        },
                        "options": [
                            {
                                "value": "brc",
                                "label": "BRC"
                            },
                            {
                                "value": "crc",
                                "label": "CRC"
                            },
                            {
                                "value": "deo",
                                "label": "DEO"
                            }
                        ]
                    },
                    "validations": [
                        {
                            "type": "required"
                        }
                    ]
                },
                {
                    "code": "district",
                    "type": "select",
                    "context": "state",
                    "default": null,
                    "templateOptions": {
                        "placeHolder": "Select District",
                        "multiple": false,
                        "dataSrc": {
                            "marker": "LOCATION_LIST",
                            "params": {
                                "id": "district"
                            }
                        }
                    },
                    "validations": [
                        {
                            "type": "required"
                        }
                    ]
                },
                {
                    "code": "block",
                    "type": "select",
                    "context": "district",
                    "default": null,
                    "templateOptions": {
                        "placeHolder": "Select Block",
                        "multiple": false,
                        "dataSrc": {
                            "marker": "LOCATION_LIST",
                            "params": {
                                "id": "block"
                            }
                        }
                    },
                    "validations": []
                },
                {
                    "code": "cluster",
                    "type": "select",
                    "context": "block",
                    "default": null,
                    "templateOptions": {
                        "placeHolder": "Select Cluster",
                        "multiple": false,
                        "dataSrc": {
                            "marker": "LOCATION_LIST",
                            "params": {
                                "id": "cluster"
                            }
                        }
                    },
                    "validations": []
                },
                {
                    "code": "school",
                    "type": "select",
                    "context": "cluster",
                    "default": null,
                    "templateOptions": {
                        "placeHolder": "Select School",
                        "multiple": false,
                        "dataSrc": {
                            "marker": "LOCATION_LIST",
                            "params": {
                                "id": "school"
                            }
                        }
                    },
                    "validations": []
                }
            ],
            "teacher": [
                {
                    "code": "state",
                    "type": "select",
                    "templateOptions": {
                        "placeHolder": "Select State",
                        "multiple": false,
                        "dataSrc": {
                            "marker": "STATE_LOCATION_LIST"
                        }
                    },
                    "validations": [
                        {
                            "type": "required"
                        }
                    ]
                },
                {
                    "code": "district",
                    "type": "select",
                    "context": "state",
                    "default": null,
                    "templateOptions": {
                        "placeHolder": "Select District",
                        "multiple": false,
                        "dataSrc": {
                            "marker": "LOCATION_LIST",
                            "params": {
                                "id": "district"
                            }
                        }
                    },
                    "validations": [
                        {
                            "type": "required"
                        }
                    ]
                },
                {
                    "code": "block",
                    "type": "select",
                    "context": "district",
                    "default": null,
                    "templateOptions": {
                        "placeHolder": "Select Block",
                        "multiple": false,
                        "dataSrc": {
                            "marker": "LOCATION_LIST",
                            "params": {
                                "id": "block"
                            }
                        }
                    },
                    "validations": []
                },
                {
                    "code": "cluster",
                    "type": "select",
                    "context": "block",
                    "default": null,
                    "templateOptions": {
                        "placeHolder": "Select Cluster",
                        "multiple": false,
                        "dataSrc": {
                            "marker": "LOCATION_LIST",
                            "params": {
                                "id": "cluster"
                            }
                        }
                    },
                    "validations": []
                },
                {
                    "code": "school",
                    "type": "select",
                    "context": "cluster",
                    "default": null,
                    "templateOptions": {
                        "placeHolder": "Select School",
                        "multiple": false,
                        "dataSrc": {
                            "marker": "LOCATION_LIST",
                            "params": {
                                "id": "school"
                            }
                        }
                    },
                    "validations": []
                }
            ],
            "student": [
                {
                    "code": "state",
                    "type": "select",
                    "templateOptions": {
                        "placeHolder": "Select State",
                        "multiple": false,
                        "dataSrc": {
                            "marker": "STATE_LOCATION_LIST"
                        }
                    },
                    "validations": [
                        {
                            "type": "required"
                        }
                    ]
                },
                {
                    "code": "district",
                    "type": "select",
                    "context": "state",
                    "default": null,
                    "templateOptions": {
                        "placeHolder": "Select District",
                        "multiple": false,
                        "dataSrc": {
                            "marker": "LOCATION_LIST",
                            "params": {
                                "id": "district"
                            }
                        }
                    },
                    "validations": [
                        {
                            "type": "required"
                        }
                    ]
                },
                {
                    "code": "block",
                    "type": "select",
                    "context": "district",
                    "default": null,
                    "templateOptions": {
                        "placeHolder": "Select Block",
                        "multiple": false,
                        "dataSrc": {
                            "marker": "LOCATION_LIST",
                            "params": {
                                "id": "block"
                            }
                        }
                    },
                    "validations": []
                },
                {
                    "code": "cluster",
                    "type": "select",
                    "context": "block",
                    "default": null,
                    "templateOptions": {
                        "placeHolder": "Select Cluster",
                        "multiple": false,
                        "dataSrc": {
                            "marker": "LOCATION_LIST",
                            "params": {
                                "id": "cluster"
                            }
                        }
                    },
                    "validations": []
                },
                {
                    "code": "school",
                    "type": "select",
                    "context": "cluster",
                    "default": null,
                    "templateOptions": {
                        "placeHolder": "Select School",
                        "multiple": false,
                        "dataSrc": {
                            "marker": "LOCATION_LIST",
                            "params": {
                                "id": "school"
                            }
                        }
                    },
                    "validations": []
                }
            ],
            "other": [
                {
                    "code": "state",
                    "type": "select",
                    "templateOptions": {
                        "placeHolder": "Select State",
                        "multiple": false,
                        "dataSrc": {
                            "marker": "STATE_LOCATION_LIST"
                        }
                    },
                    "validations": [
                        {
                            "type": "required"
                        }
                    ]
                },
                {
                    "code": "district",
                    "type": "select",
                    "context": "state",
                    "default": null,
                    "templateOptions": {
                        "placeHolder": "Select District",
                        "multiple": false,
                        "dataSrc": {
                            "marker": "LOCATION_LIST",
                            "params": {
                                "id": "district"
                            }
                        }
                    },
                    "validations": [
                        {
                            "type": "required"
                        }
                    ]
                },
                {
                    "code": "block",
                    "type": "select",
                    "context": "district",
                    "default": null,
                    "templateOptions": {
                        "placeHolder": "Select Block",
                        "multiple": false,
                        "dataSrc": {
                            "marker": "LOCATION_LIST",
                            "params": {
                                "id": "block"
                            }
                        }
                    },
                    "validations": []
                },
                {
                    "code": "cluster",
                    "type": "select",
                    "context": "block",
                    "default": null,
                    "templateOptions": {
                        "placeHolder": "Select Cluster",
                        "multiple": false,
                        "dataSrc": {
                            "marker": "LOCATION_LIST",
                            "params": {
                                "id": "cluster"
                            }
                        }
                    },
                    "validations": []
                },
                {
                    "code": "school",
                    "type": "select",
                    "context": "cluster",
                    "default": null,
                    "templateOptions": {
                        "placeHolder": "Select School",
                        "multiple": false,
                        "dataSrc": {
                            "marker": "LOCATION_LIST",
                            "params": {
                                "id": "school"
                            }
                        }
                    },
                    "validations": []
                }
            ]
        }
    }
]