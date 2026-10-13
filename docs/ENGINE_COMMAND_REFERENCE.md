# Console Commands
`Show` | Show script value
`ShowVars` | Show variables on object. You can optionally specified a papyrus variable or script to filter with [player->sv]
`ShowGlobalVars` | Show all global variables.
`ShowQuestVars` | Show quest variables. You can optionally specified a papyrus variable or script to filter with [svq QuestID]
`ShowQuests` | List quests.
`ShowQuestAliases` | Show quest aliases. [ShowQuestAliases QuestID]
`SetPapyrusQuestVar` | Set a Papyrus property on the specified quest.
`SetPapyrusVar` | Set a Papyrus property on the selected ref.
`SetQuestAliases` | Set quest aliases. [SetQuestAliases QuestID]
`ClearQuestAliases` | Clears quest aliases. [ClearQuestAliases QuestID]
`SetQuestLocationAliasDebug` | Sets a debug location for a quest alias before it starts.
`SetQuestRefAliasDebug` | Sets a debug ref for a quest alias before it starts.
`ToggleCombatStats` | Command removed. Use TDT and switch to COMBAT INFO page.
`ToggleAI` | Toggle AI processing for selected reference, or for all references if none selected.
`ToggleCollisionGeometry (TCG)` | Show collision geometry.
`ToggleVolumeGeometry (TVG)` | Show volume geometry.
`ToggleMaterialGeometry (TMG)` | Show material geometry.
`ToggleStairsGeometry` | Show stairs geometry.
`ToggleBorders` | Show border lines for each cell.
`ToggleSky (TS)` | Show/Hide the Sky.
`ToggleWireframe` | Show the world as wireframe.
`ToggleCollision` | Toggles collision detection and disables gravity.
`ToggleDebugText` | Show debug numbers on the screen.
`ToggleMenus` | Hide all the menus. Used for taking screen shots.
`TogglePrimitives` | Show/Hide all primitives.
`ShowScenegraph` | Create a window with the full game scene graph or the scene graph of the selected reference. SSG 1 for PC overlay version.
`ToggleMagicStats (TMS)` | Show magic stats.
`ShowAnim` | Show Animation and Actor status.
`Show1stPerson` | Show the 1st person Model from the 3rd person camera. If in 3rd person mode it will show both.
`Help` | Show this help.
`ToggleNavMesh` | Toggle blocked display.
`TogglePathLine` | Toggle path display.
`PickRefByID` | Select a reference by id for the console.
`PickLastRef` | Select the last created ref for the console.
`PickNextRef` | Select the the next ref in the center of the screen outside the console
`PickNextActor` | Select the the next actor in the center of the screen outside the console
`PickClosestActor` | Select the the closest actor to the player
`PickClosestShip` | Select the the closest ship to the player's ship
`GetSelectedRef` | Get the currently selected ref
`IsLastRef` | Check if this is one of the last created refs
`SetLightingPasses` | 4 (0/1) values. amb\|diff\|tex\|metal ex: 1010
`TriggerUIEffect` | Toggles a specific UI scene.
`Particle` | Particle system debug.
`CharacterLight` | Configures character lighting.
`ShowLightBounds` | Toggles the rendering of light bounds on/off.
`VatsTarget` | Show VATS targeting information.
`ToggleScalableAmbientOcclusion` | Configures SAO settings.
`ToggleMotionBlur` | Configures motion blur settings.
`ToggleContrastAdaptativeSharpening` | Toggle ContrastAdaptativeSharpening
`ToggleTAA` | Toggles temporal anti-aliasing on/off.
`ToggleFSR1` | Toggle FSR1
`ToggleFSR2` | Toggle FSR2
`ToggleVRS` | Toggle VRS
`VisualizeData` | Visualize specified data set (Pass input, GBuffer, or Pass output)
`ToggleHandsCulled` | Cull/Uncull 1st person hands
`ToggleLensFlare (LF)` | Toggles lens flare rendering on/off.
`RenderLocalMap` | Saves the local 2D minimap to an image file on disk.
`SetLODObjectDistance` | Sets LOD Distance values for LOD0, LOD1, LOD2, and LOD3.
`CenterOnCell` | Moves the player to the specified cell.
`SetGameSetting` | Sets the value of a GameSetting.
`SetINISetting` | Sets an INI setting value.
`GetINISetting` | Prints an INI setting value to the console.
`CenterOnExterior` | Moves the player to the exterior cell specified by the (X, Y) cell coordinates.
`CalcPathToPoint` | Shows the pathfinding path from the player's location to the location of the selected reference.
`CalcLowPathToPoint` | Shows the pathfinding path from the player's location to the location of the selected reference. Ignores locks, allows disabled doors, ignores min use
`ToggleRainOcclusion` | toggles rain occlusion
`ToggleDetection` | Toggles AI detection for all AI.
`ToggleHighProcess` | Toggles AI processing for AI in the High Processing list.
`ToggleLowProcess` | Toggles AI processing for AI in the Low Processing list.
`ToggleMiddleLowProcess` | Toggles AI processing for AI in the MiddleLow Processing list.
`ToggleMiddleHighProcess` | Toggles AI processing for AI in the MiddleHigh Processing list.
`ToggleAiSchedules` | Toggles processing of all AI's editor schedules.
`SpeakSound` | Forces the selected actor to speak the specified sound.
`GetSFSEVersion` | EDITOR'S NOTE: Only if SFSE is installed.
`GameComment` | Adds a comment about the game to the GameCommentDB. (Ex. This monster is too hard)
`ToggleCellNode (TCN)` | Toggle 3D for a Cell child node: 0-Actor, 1-Marker, 2-Land, 3-Water, 4-Static, 5-Active
`SetCameraFOV` | Change the camera's field of view (in deg): default 75
`ToggleGodMode` | Toggle God mode (infinite health/stamina/magicka).
`ToggleScripts` | Turn Script processing on/off
`ToggleConversations` | Toggle conversation stats
`ToggleFullHelp` | Toggle Full Help
`ShowQuestLog` | Show Quest Log
`ShowFullQuestLog` | Show all log entries for a single quest
`DumpModelMap` | Dump model map contents to file
`CenterOnWorld (COW)` | [COW worldname -10 5]
`ToggleGrass` | Toggle grass display.
`CreateGrassAt` | Create a single piece of grass at specified worldspace coordinates.
`AddFaceAnimNote` | Add Face Anim Note is no longer supported.
`RefreshINI` | Refresh INI settings from file.
`ToggleEmotions` | Toggle NPC facial emotions.
`AddDecal` | Adds a new impact decal onto the selected reference.
`TestCode` | Used by programmers to quickly test local code.
`PlayerSpellBook` | Add all spells to player.
`PrintAiList (pai)` | Printed Ai Lists.
`ShowQuestTargets` | Show current quest targets
`HairTint ()` | 3 ints, RGB
`SaveGame (save)` | SaveGame <filename>
`LoadGame (load)` | LoadGame <filename>
`DisplayPlayerIDs` | DisplayPlayerIDs
`SetDisplayPlayerID` | SetDisplayPlayerID <filename>
`TestAllCells` | TestCells
`RenderTestCell` | runs Render Test on player's current parent cell
`RenderTestHere` | runs Render Test on player's current position
`SaveWorld` | Save hkWorld <filename>
`ReloadCurrentClimate` | Reloads values from the current climate
`ReloadCurrentWeather` | Reloads values from the current weather
`TestSeenData` | Visually displays the current seen data
`TestLocalMap` | Simulates the local map. (1 or 0 for FOW on or off)
`MoveToQuestTarget` | Move player to current quest target.
`PrintNPCDialog` | Prints NPC dialog
`ShowSubtitle` | show all dialog subtitles (1 shows always, 0 hides always)
`ShowRenderPasses` | display render passes for the next frame
`FreezeRenderAccumulation` | only re-render geometry visible during this frame
`OutputMemContexts` | Output Mem Context info to a file
`OutputMemStats` | Output Mem Stats info to a file
`SetMemCheckPoint` | Set the current memory checkpoint (value, optional context name)
`GetMemCheckPoint` | Get the current memory checkpoint (optional context name)
`IncMemCheckPoint` | Increment the current memory checkpoint (optional context name)
`OutputAllocations` | Output memory allocations (file, optional context name, optional start context, optional end context)
`AddWatchAddress` | Adds an address range to watch out for.
`RemoveWatchAddress` | Removes an address range that we no longer want to watch.
`ToggleDetectionStats` | Show the detection stats of the current selected Ref.
`SetTargetRefraction` | Sets the refractive value of the target
`ToggleCharControllerShape` | Toggle char controller shape type.
`ShowHeadTrackTarget` | Show the head track target if set from look function
`SetTranslucency` | Set translucency runtime values.
`VisualRefPosition` | Places an axis object at the ref position.
`RevertWorld (rw)` | Revert the world
`OutputArchiveProfile` | Output Archive profile info to a file
`QuitGame` | Exit game without going through menus.
`Screenshot` | Take a screenshot (optional use HDR)
`SaveIniFiles` | Writes all the .ini files.
`SetDebugText` | Sets which debug text is shown.
`GetDebugText` | Gets which debug text is shown.
`ToggleLiteBrite` | Toggles lite brite render mode (no shadows/no lighting mode).
`RunMemoryPass` | Runs a cleanup memory pass
`ResetMemContexts` | Reset Max Mem Contexts
`ShowWhoDetectsPlayer` | Show who detects the player
`ToggleCombatAI (tcai)` | Toggles ALL Combat AI
`ToggleGamePause (tgp)` | Toggles game pause state
`StepOneFrame` | Advances the game one frame
`AEConnect` | Reconnects to the animation editor
`ToggleFlyCam` | Toggles the Free Fly camera (UFO cam).
`ToggleFXCam` | Toggles the FX camera.
`BeginTrace` | Creates a trace file (Xenon only)
`RunCellTest` | Runs a cell test
`StartAllQuests` | Starts all quests
`CompleteAllQuestStages (caqs)` | Sets all quest stages
`WasteMemory (wm)` | Allocates some memory (in MB).
`SetHudGlowConstants` | Set parameters for HUD glow.
`CloseFile` | Force-closes an open ESP/ESM file.
`SendSherlockDebugText` | Shows a Sherlock debug page.
`PlayExplosion` | Plays explosion seq in selected obj
`SetTargetDOF` | Sets the depth of field based on the target
`ToggleFullScreenMotionBlur` | Toggles Full screen motion blur
`SetMovementType` | Temporarily change an actor's movement type
`SetVel ()` | Sets Velocity on a reference
`DebugCombat` | Debugs combat systems
`ToggleCombatDebug` | Toggles combat debug info
`DebugPathing` | Debugs pathing systems
`TogglePathingInfoFunction` | Toggle pathing information.
`ShowInventory` | Shows reference inventory [1 = Show Armor Addons]
`ShowInventoryVars (siv)` | Shows reference inventory script data
`ResetPerformanceTimers` | Resets the performance timers
`ToggleDebugDecal` | Toggle debug displays for decal creation : 0-Wireframe, 1-Solid, 2-Occlusion Query, 3-Transform
`ToggleDecalRendering` | Toggle decal rendering
`SetImageSpaceModifiersEnable` | Set imagespace modifiers enable: 0-Off, 1-On
`SetUFOCamSpeedMult` | Set speed mult for free camera. (Speed Mult, Look Mult Optional)
`ToggleTestLight` | Toggle test light (radius, magnitude).
`PlaceLocationMarker` | PlaceLocationMarker x y z (optional name) (optional color )
`ClearLocationMarkers` | Delete all location markers in the player's current cell.
`SetGlobalRadialBlur` | Set parameters for the global radial blur
`OutputTextureUseMap` | Writes out texture use map data to file.
`ClearScreenBlood` | Clear screen blood
`ResetDialogueFlags` | Debug resets SayOnce, TalkedToPc, etc.
`GetValueInfo (GetAVInfo)` | Get details about a reference actor value.
`ToggleBoundVisGeom` | Toggles bound visualization for a ref
`SetConsoleOuputFile (scof)` | Sets the given file as target for console output.
`PlayVATSCameras` | Play this set of VATS cameras for the next VATS playback.
`SetTargetFalloff` | Sets the falloff of the target
`ToggleActorMover` | Toggles actor movement through pathing system
`CopySaves` | Copy save games from the host machine or a memory stick (ms).
`ForceFileCache` | Enumerates Miles samples and streams
`DumpNiUpdates` | Dumps the next frame's calls to NiNode/NiAVObject::UpdateDownwardPass to NiDump*.xls (only Debug/PIX 360 builds)
`ToggleDepthBias` | toggles depth bias for decals on or off
`EnablePartRepair ()` | Enable/Disable the ability to repair a spaceship part
`UpdateVFX` | Update the visual fx
`WaitBatchFile` | Pause a "Batch File" for a set amount of time.
`RefuelSpaceship` | Refuels the selected ship, or the player's spaceship if none is selected
`ModifyFaceGen` | Modify FaceGen Functionality
`DamagePart` | DamagePart <part> #
`EvalActorTextures` | Evaluate actor texture usage and possible memory savings from not using the uppermost MipMap level.
`CreateSaveData` | Creates save data.
`CreateGameData` | Creates game data.
`LoadFlashMovie` | Loads a Flash movie for the GUI
`ShowMenu` | Show or create a menu
`HideMenu` | Hide or close a menu
`RecvAnimEvent` | Simulate recieving an animation event from an animation graph.
`RunConsoleBatch` | Run a console batch file
`LTGraph` | Sets the input-to-player movement graph
`RTGraph` | Sets the input-to-camera movement graph
`ToggleHeapTracking` | Toggle Heap Tracking
`TogglePoolTracking` | Toggle Pool Tracking
`RumbleManager (RM)` | RumbleManager
`InstallMemoryTracker (IMT)` | Install Memory Tracker
`UninstallMemoryTracker` | Uninstall Memory Tracker
`CheckMemory` | Check Memory
`SetStackDepth` | Set Stack Depth
`PathToRef` | Force actor to path to reference.
`StartAIControlledRobotTest` | Starts player pathing memory test.
`TestHandleManagerWarnAndKillSDM (THMWAKS)` | Purely for testing: lists every un-destroyed handle, then destroys it.
`SetFaceTarget (SFT)` | Force actor to face a reference.
`PrecomputedLOSGeneration` | Perform various generation functions based on the specified input string.
`PrecomputedLOSDebug` | Perform various debug functions based on the specified input string.
`GenerateCoverEdges` | Generate cover edges for the current cell.
`GenerateCoverDebug` | Debug cover edge generation.
`GenerateTraversalData (gtd)` | Generate traversal data for the current cell/ref.
`SetPathSprinting` | Force actor to sprint.
`SetAnimGraphVar` | Set an animation graph variable.
`SetBloodParam` | Set blood parameters.
`RegisterPrefix (RPRFX)` | Register all resources at a path prefix.
`ToggleEventLog` | Show a log of misc. events for the selected debug REFR.
`ExportPerfTrackingData` | Export performance monitor tracking data to a file.
`DisplayGraphVariable` | Gives control of variable filters used on the animation debug text page.
`ToggleMotionDriven` | Toggles motion driven animation
`ToggleControlsDriven` | Toggles controls driven character
`ToggleGUIOverlay` | Toggles the graphical overlay
`ModifyGUIOverlay` | Modifies a graphical overlay
`AddCustomOverlay` | Adds a custom overlay
`SetCustomOverlayForm` | Sets the form for a custom overlay
`CloseCustomOverlay` | Closes a custom overlay
`SetActionComplete` | Sets all active actions on actor in scene complete
`SetConsoleScopeQuest` | Sets the scope quest for all console functions. No param clears current scope quest.
`GetDistanceFromActorsPath` | Prints out the distance from a reference to an actor's path.
`ClearConsole` | Clears the console log
`ToggleMarkers` | Toggle markers
`KillAllProjectiles (kap)` | Kill all projectiles
`PlayTerrainEffect (PTFX)` | Plays a terrain effect at target REFR
`CellInfo` | Toggle Cell Info
`Timing` | Toggle Timing Info
`Polygons` | Toggle Mesh Render Info
`Actors` | Toggle Actor Info
`Quest` | Toggle Quest Event Info
`Particles (Particles)` | Toggle Particle Info
`Memory` | Toggle Memory Info
`FileStreamerStats` | File streamer stats
`SetGraphicMemoryHysteresis` | Set graphic memory hysteresis
`AllocateGraphicMemory` | Allocate graphic memory to check hysteresis
`ShowNodes` | Show nodes- [All], [Off]
`ShowBones` | Show bones toggle
`ShowBonesFlags` | Show bones flags
`ShowBonesDepth` | Show bones depth
`ShowBonesNameFilter` | Show bones name filter
`SaveDebugTextPages` | Save Debug Text Pages settings to .ini file.
`OutputFixedStringTable (OFST)` | Output the fixed string table to a file.
`AttachPapyrusScript (APS)` | Attaches a papyrus script to a reference
`SaveHavokSnapshot` | Saves a Havok snapshot of the hkpWorld the player is currently in
`SetNPCWeight (SNPCW)` | [0-100]: Sets the weight of an NPC and reloads his 3D to visualize the weight change
`ShowClosestLocationForSphere (SCLFS)` | Finds the closest location where a sphere can fit in the navmesh, and displays it
`PrintShaderMacros (PSM)` | Given a shader and technique ID, prints the macros used to compile its shader.
`ToggleAudioOverlay` | Toggle the Audio Debug Overlay.
`TogglePapyrusLog` | Toggle the Papyrus Log Overlay.
`ToggleContextOverlay` | Toggle the Context Overlay.
`ForceOutOfMemory` | Forces an OOM state.
`ToggleMovement` | Toggles all actor movement
`ToggleAnimations` | Toggles all actor animations
`SetWarning` | Params: Name [0/1]. 0 is default for 2nd param.
`TestFadeNodes (TestFN)` | Test all BSShaderProperties in the scene graph for BSFadeNode pointer integrity.
`ShowLowMaxHeights (slmh)` | Shows or hides the low res max height data.
`ShowHighMaxHeights (shmh)` | Shows or hides the high res max height data.
`EnableStoryManagerLogging` | Enable story manager logging.
`DumpPapyrusStacks (dps)` | Dumps all Papyrus stack information to the log
`DumpPapyrusTimers` | Dumps all Papyrus timer registrations to the log
`DumpPapyrusLOSEvents` | Dumps all Papyrus LOS event registrations to the log
`DumpPapyrusDistanceEvents` | Dumps all Papyrus distance event registrations to the log
`DumpPapyrusPersistenceInfo (dppi)` | Dumps everything in Papyrus persisting the reference called on, or passed in
`DumpPapyrusEventRegistrations` | Dumps all Papyrus event registrations for the specified object (and script)
`RunCompaction` | Run a pass of compaction if possible.
`ToggleImmortalMode` | Toggle Immortal mode (health/stamina/magicka can decrease but never go to zero).
`SetSubgraphToDebug` | Subgraph To Debug
`EnableRumble` | Enables / disables rumble.
`HavokVDBCapture` | Havok VDB Capture
`ToggleNavmeshInfo` | toggle a view mode similar to the map camera and displays navmesh infos
`PlaySyncAnim` | Play Sync Anim
`SetFormKnown` | Sets the known flag on a form
`SetDebugQuest` | Sets the quest to be the only one startable for its event type.
`SetQuestAliasLogging` | Turns alias logging on/off for a quest.
`SetRace` | Sets the passed in actor's race.
`FindForm (find)` | Find a form
`StartPapyrusScriptProfile (StartPSP)` | Starts profiling a Papyrus script.
`StopPapyrusScriptProfile (StopPSP)` | Stops profiling a Papyrus script.
`StartPapyrusFormProfile (StartPFP)` | Starts profiling Papyrus scripts on a form.
`StopPapyrusFormProfile (StopPFP)` | Stops profiling Papyrus scripts on a form.
`StartPapyrusStackRootProfile` | Starts profiling all Papyrus stacks starting at a script.
`StopPapyrusStackRootProfile` | Stops profiling all Papyrus stacks starting at a script.
`TogglePapyrusGlobalProfiler (TPGP)` | Toggles Papyrus global profiling on and off (profiles *everything*).
`PrintQuestSceneInfo` | Prints to the Quest Inf file the current state of scenes.
`IsInvulnerable` | Is the actor invulnerable?
`CollisionMesh` | Toggle Mesh Collision Info
`HavokWorldStep (hkstep)` | Toggle bhkWorld Havok Step Info
`IsolateRendering` | Enable isolated rendering for selected object.
`ToggleWaterCurrentGeometry` | Displays or hides water current geometry
`PerformAction` | Performs the specified action on the selected actor.
`StartTrackPlayerDoors` | Starts tracking player-activated teleport doors.
`StopTrackPlayerDoors` | Stops tracking player-activated teleport doors.
`CheckPlayerDoors` | Compares the Tracked Player path with the quest target path.
`SetInChargen` | Toggles aspects of Chargen Mode on/off [savingDisabled][waitingDisabled][activationMessageDisabled]
`ForceReset` | Force the game to run a full reset.
`ForceCloseFiles` | Close masterfile & plugins. Useful for letting CreationKit save to a plugin that is also loaded in-game. See also HotLoadPlugin. [Caution: Use at own risk! Gameplay and new savegames may be unstable.]
`HotLoadPlugin (HLP)` | Load or reload the named plugin.  Useful for getting changes without restarting. See also ForceCloseFiles. [Caution: Use at own risk! Modified running quests will be stopped (and restarted if possible). Gameplay and new savegames may be unstable.]
`GenerateBendableSpline (Spline)` | Generate a bendable spline geometry instance.
`ReloadScript ()` | Reloads the specified Papyrus script
`TestAim` | Test an actor's aim
`TestLook` | Test an actor's looking
`PushCamera` | Push camera to editor
`MoveToEditorCamera` | Move to the editor camera
`MoveToEditorSelection` | Move to the editor selection
`PlaceFurnitureTester (PFT)` | Place actor, who will use the selected furniture. Can specify actor type via optional parameter.
`DumpConditionFunctions` | Output the current counters for condition function calls.
`ReloadAnimationGraphs` | Reload the currently loaded animation graphs.
`ToggleWeaponOverlay` | Toggle the weapon overlay.
`ForceDetect` | Forces the selected actor to detect the specified actor.
`ChangeAnimArchetype (caa)` | Change the selected actor's anim archetype
`ChangeAnimFlavor` | Change the selected actor's anim flavor
`SetAngryWithPlayer` | Set the angry with player flag
`ForceRepath` | Force the actor to repath
`ForcePathFailure` | Force the actor's path to fail
`DumpFormList` | Dump the contents of the given formlist to the console output
`TraceAnimationEvents` | Trace an actor's animation events
`ShowMods` | Show all property mods on an object
`DumpInputEnableLayers` | Dumps all currently used input enable layers to the console
`AttachMod` | Attach a mod to an object
`RemoveMod` | Remove a mod from an object
`SpawnTemplatedObject` | Spawn a ref to a templated object.[object, ilevel, pkeyword1, pkeyword2]
`CallFunction` | Calls a papyrus function on the targeted ref. First parameter is the function, the rest are parameters
`CallQuestFunction (cqf)` | Calls a papyrus function on a quest. Second parameter is the function, the rest are parameters
`CallGlobalFunction (cgf)` | Calls a global papyrus function. First parameter is the function, the rest are parameters
`ResetInputEnableLayer` | Resets all control disables on a specific input enable layer
`ForceEnablePlayerControls (fepc)` | Force-enables the player's controls, regardless of layers, see EnablePlayerControls
`ResetForceEnabledPlayerControls` | Resets all force-enabled player controls
`GetActorRefOwner` | Prints the owner of the currently selected reference.
`SetActorRefOwner (saro)` | Sets ownership of the currently selected reference to the specified actor (or if no actor is specified, to the player).
`HasActorRefOwner (haro)` | Returns 1 if the currently selected reference has an owner, or 0 otherwise.
`SetOutfit` | Change the default outfit for the actor
`PassTime` | Passes the given number of hours as if the player were sleeping.
`LinkLocations` | Links two locations under the given keyword.
`ShowLinkedLocations` | Outputs all locations linked to the given one under the given keyword.
`SetLinkedRef` | Links the current ref to the given one under the given keyword.
`ResetContainer` | Resets the currently selected container, or if you specify "1", then it'll reset all containers.
`SetSceneForDebug` | Sets the current debug scene.
`PreloadExterior` | Preloads the exterior data for the currently selected ref.
`TestPath` | Debug function to test a path.
`ToggleControlsOverlay` | Toggle Controls Overlay
`Refresh` | Debug function to refresh a reference.
`DynamicResolution` | Change the dynamic resolution settings
`TestLoadingMenu` | Debug function to open/close the Loading menu in the Loading thread.
`RecalcInstanceData` | Debug function recalc instance data for the selected ref or all loaded refs if nothing is selected.
`ToggleReferencePose` | Toggles forcing an animgraph for the selected actor to be in the reference pose. May specify "target" or "rig" as well.
`SetPersistLocation` | Debug function to set the persist loc on a reference.
`SetLocationRefType` | Debug function to set the loc ref type for a location on a reference.
`ShowLocData` | Debug function to dump data about a location.
`ReserveLoc` | Debug function to reserve a location so it can't be used for most aliases.
`UpdateAwakeSound (UAS)` | Update the selected actor's current conscious loop.
`SetHarvested` | Mark the current reference as Harvested or not..
`PauseScene` | Pause or unpause the specified scene
`SpawnDupe` | Make a duplicate ref of the selected ref
`DisableDistantReferences` | Disable references more than a certain distance from the selected ref
`FireAssert` | Fire an assert (with text passed, if available).
`ForcePersistent` | Force a reference to become persistent
`PlayActionCamera (pac)` | Play this action camera on the reference with a target reference
`StopActionCamera` | Stop the action camera
`ChangeStance` | Change the actor's stance
`AuditionWwiseEvent` | Set of commands for auditioning Wwise events.
`AuditionReverbForm (arf)` | Force a given Reverb form to be active.
`SetWwiseState (sws)` | Sets a global Wwise State
`BuildAnimationData (bad)` | Build the animation data for the actor
`SwitchSkeleton` | Toggles between standard and chargen skeletons for an actor.
`GetHelloorGreeting ()` | Prints out the info id for actors hello/greeting to actor param. One of these should be the player.
`SetBoneTintRegion` | Add bone tint data to an object's 3d given a region ID (integer) of that object.
`SendDialogueEvent` | Sends a dialogue event for the selected and target actor
`SetForceSpeechChallengeAlwaysSucceed ()` | player will always succeed at speech challenge
`SetForceSpeechChallengeAlwaysFail ()` | player will always fail at speech challenge
`RunMaterialsAnalysis (rma)` | Compares the materials of the selected reference
`CaptureMessages ()` | Captures DebugString, USER1 and USER2 messages using a Message Event Listener and sends the outout to CaptureMessage.lua
`SetGpuMemoryPriority ()` | Sets the GPU memory priority.
`CaptureMessage` | on to turn on else off
`ToggleTrijuice` | Toggles Trijuicing in the renderer (may slightly degrade texture filtering quality in exchange for improved performance).
`SetPresentThreshold (spt)` | Set percentage (0 - 100) of scanlines covered before swap threshold is hit: default 0 (always swap)
`LinkFullAccount` | Link full BNet account to game-account: link <username> <password>
`IsLoggedIn (isonline)` | Is the player logged in to Bethesda.net?
`GetLegalDocs (getlegaldocs)` | Retrieves a list of all required legal documents
`AcceptLegalDoc` | Accepts a legal document based on its ID: acceptlegaldoc <id>
`GetDataAttachment` | Prints data from Bethesda.net Profile Data Attachment: getattachment <type> <id>
`DeleteDataAttachment` | Deletes a Bethesda.net Profile Data Attachment: deleteattachment <type> <id>
`UploadCharacterData` | Uploads character data payload as bnet Profile Data Attachment.
`GetAttachmentLeaderboard (getattachmentleaderboard)` | Gets attachment leaderboard page: getattachmentleaderboard <attachment type> <leaderboard type>
`LoadUnityData` | Gets character data from leaderboards and caches it.
`MakeUnityNPC` | Updates NPC with data from unity cache.
`SetVolumetricLightingParameters (vl)` | Set volumetric lighting parameters.
`StartWorkshop (workshop)` | Enter Workshop mode if the player is within the buildable area of a Workshop.
`ToggleVBlankOptim` | Toggles VBlank optim
`AddKeyword` | Add the given keyword to the reference.
`RemoveKeyword` | Remove the given keyword on the reference.
`SetAmbientParticlesEnabled` | Enables(1)/disables(0) ambient particles.
`RemoveOutpost ()` | Removes the given Outpost and all built items.
`SetESRAMSetup` | Force specific ESRAM setup (-1 for automatic setup)
`CallStackTraceDepth` | Set the callstack depth when tracing it.
`CommandedActivate` | Commands selected actor to use a reference
`EnableGalaxyMode` | Enables/Disables galaxy mode.
`ToggleStarFieldDebug` | Toggles the StarField debug on or off
`SetStarFieldCoordinateScale ()` | Sets the StarField coordinate scale.
`SetStarSystemScale (sss)` | Sets the star system scale.
`MoveToPlanet` | if target player ship, move to, or give path to pilot to <target> <1 to do full jump sequence>
`SetOrbitSpeedScale` | Sets global orbit speed scale
`InstanceNamingRules` | Export instance naming rule data to file INRExport.txt
`GetOrbisModInfo` | Prints info relating to Orbis mod game data files.
`ToggleSceneDebug` | show debug state for scene
`SetFarClip` | Set far clip value. (-1 to clear override)
`ToggleOverdraw` | Toggle overdraw
`RecordScene` | Capture screen shots of scene. (Scene EditorID, [FPS 60 default])
`LandOnPlanet (lop)` | Land on a planet. (lop <planetname> <lon> <lat> <deg or rad>)
`TakeOffToSpace` | Take off to space.
`PreviewBodyResources (pbr)` | Previews resources for a planet.
`SendAffinityEvent` | (AffinityEvent [ObjRef]) Run an affinity event on an optional object reference.
`AddPower` | AddPower <part> #
`RemovePower` | RemovePower <part> #
`MatlockCapture` | Force matlock to realize a capture.
`ToggleSnapNodeMarkers` | Toggle snap node markers.
`SetVoiceType` | Set an override voice type on an actor
`AddWorldSpaceToPlanet` | Adds a world space to a planet.
`DebugDataProvider` | Set the name of the UI Data Provider we want to debug
`LoadAll3D` | Load all queued 3D
`PrintAllMenus (pam)` | Print all active menus
`PrintAllInputContexts (paic)` | Print the input context stack
`AddPlotToBody (AddPlot)` | Plot a route to this body
`ReloadFaceData` | Reload face data
`SetGravityScale` | Sets gravity scale on a ref's parent cell
`PreviewBlock` | PreviewBlock <blockname> <biome>
`ExportTerrainTextures` | Export terrain textures
`ExportTerrainGrids` | Export terrain grids
`ExportTerrainHeightMap` | Export terrain height map
`ExportTerrainSplatMap` | Export terrain splat map
`ExportTerrainMaterialIndexMap` | Export terrain material index map
`ExportTerrainFiles` | Export terrain files
`UpdateTerrainClipmaps` | Refresh Terrain Clipmaps
`ToggleDebugCamera` | Toggle debug camera <mode name>
`CyclePrevDebugCamera` | Cycle to previous debug camera
`CycleNextDebugCamera` | Cycle to next debug camera
`ToggleDebugCameraControls` | Toggle debug camera controls
`SetImGuiWindowFunction (siw)` | Activate an ImGui window
`InvokeUIEvent` | Invokes a ui->c++ event
`HotReloadUI` | Hot Reloads the User Interface SWFs.
`SetPosRelativeToRef` | Script function to set the position of the picked ref relatively to another ref (defaulted to the player).
`FaceRef` | Make a ref face towards another ref (defaulted to the player), with an extra angle offset.
`SetWorkshopItem` | Set the Workshop menu's Node Cursor to the currently selected reference, if any.
`GenerateNavMesh` | Generates nav-mesh on the current cell.
`LandOnPlanetAnimated` | land players spaceship with animation
`startNewGame` | Command to trigger new game on main menu without UI
`ForceBleedout` | Force an actor to enter bleedout
`ForceConditionFormTrue` | Force a condition form to true. args: FromID, (enable)0/1, (permanent)0/1
`ForceConditionFormFalse` | Force a condition form to false. args: FromID, (enable)0/1, (permanent)0/1
`LandOnPlanetBiome` | Land on a planet's biome. (lopb <planetname> <biome index> [(centered)0/1])
`LandOnPlanetMarker` | Land at a marker on the current planet
`TestAllPlanets` | TestPlanets
`ClearLinkedRef` | clear a linked reference
`SetLocalTime` | Sets the local time on the current planet, optionally updating the galaxy sim.
`ReloadMaterials` | Reloads all materials.
`PlacementOnCell` | Test overlay placement on a cell. (poc <cellindex.x> <cellindex.y>
`ToggleWorkshopFlyCam` | Toggle workshop flycam
`CheckBiomeMarker` | Finds uses in the loaded area of the given biome marker
`TestBiomePlanet (tbp)` | Creates a full planet set to use the given biome exclusively and puts the player there.
`PreviewPattern` | PreviewPattern <patternname> <biome>
`SetHavokDynamic` | Set reference motion to dynamic with optional mass in kg
`SetHavokKinematic` | Set reference motion to kinematic
`SetHavokActive` | Set reference havok activity
`SetHavokLOD` | Set reference collision lod
`SetHavokLinearVelocity` | Set reference linear velocity
`SetHavokAngularVelocity` | Set reference angular velocity
`SetHavokCollisionLayer` | Set havok collision layer
`SetHavokRagdollFriction` | Set havok ragdoll friction
`SetHavokParam` | Set havok param
`ShowHavokRagdollValues` | Show havok ragdoll values
`StartHavokPartTest` | Start/reset havok particles test
`StopHavokPartTest` | Stop havok particles test
`SetOrientation` | Set reference orientation
`ToggleDebugText3D` | Toggle in game debug text
`ToggleBiOverlay` | Toggle the BI Overlay.
`ToggleMetricViewer` | Spawn Metric Viewer.
`PrintMessage` | Print a message to the screen(print <message> <time> <clear previous messages flag>
`AddDebugText` | Add debug text to a reference(AddDebugText <debug text> <size> <color> <background color> <border color> <offsetX> <offsetY> <offsetZ> <pinned flag>
`DisableActorPackage` | Disable or enable an actor's package(DisableActorPackage <0/1>
`StopBatchFile` | Stop a running batchfile
`CenterOnSpaceCell` | move to the specified space cell, optionally specify a ship
`DependencyGraphDump` | Dump Dependency Graph
`ToggleExperimentalShaders` | Toggles experimental shaders on/off.
`SetTestPlanetAndBiome` | Sets a test planet and biome for interior testing with biome markers. (stpb [planetname] [biome form \| biome index]>)
`ShiftWorldOrigin` | Shift the world origin coordinates (ShiftWorldOrigin <opt X> <opt Y>
`ScanAllWorlds` | Scan all celestial bodies
`ClearAllWorlds` | Clears all knowledge of celestial bodies
`StartRobotQuestTester (srqt)` | Starts the quest testing robot on the player
`PauseRobotQuestTester` | Pauses or resumes the quest testing robot on the player
`CopyAppearance` | Copies customization data from one actor to another. If no source actor is provided, the player will be used.
`HotloadPlugin` | Load or reload the named plugin.  Useful for getting changes without restarting. See also ForceCloseFiles. [Caution: Use at own risk! Modified running quests will be stopped (and restarted if possible). Gameplay and new savegames may be unstable.]
`ToggleWwiseProfiler` | Toggles the wwise profiler
`SpawnParticleSystem` | Spawns a particle system on a refr
`RemoveWorkshopItems` | Remove all built items at the specified Workshop Activator.
`ToggleHerdDebugHighlight` | Show highlight the herd of this ref it is has oneRef.
`ToggleLockTerrainUpdate (TLTU)` | Toggle the lock preventing the terrain manager from updating the clipmap center
`SetTerrainClipmapCenter` | Set the center of the clipmap and lock the terrain updates
`CreateGoto` | Create a goto string for the current position and print it to the console
`Goto` | Goto a location passed by a string
`ApplyChargenMorph` | set the weight of a morph ex: apcm <morphname> <value(float)>
`SetEyeColor` | usage : iclr <color> \| list
`ToggleDepthLeak` | Toggle Depth Leak Visualization
`SetHeadPart` | Sets the headpart by name, type 'shp <type> list' to see all available headparts of type
`TestAllWeathers` | Transitions through all weathers
`TestClimateWeatherTransitions` | Iterates through all possible weather transitions within a climate
`SetHairColor` | hclr <color> \| list
`SetFacialHairColor` | fhclr <color> \| list
`SetEyebrowColor` | ebclr <color> \| list
`SetSkinTone` | sst <number corresponding to skin tone index>
`RegenFCT` | pick actor ref, do 'fct'
`MoveContainerContentToUnfilledContainers` | Transfer container's content down the line to unfilled containers.
`TestSaveLoad` | Run a test for the save load system
`GetCurrentCell` | Displays the name & ID of the cell containing the camera.
`PrintTraceRefObject` | Print Trace For Object stack array to file
`BakeFCT` | create and write the Face Customization Texture output to disk
`KillParticleSystems` | Kills a particle systems on a refr
`GetPronoun` | pron
`AddWorldSpaceToPlanetBiome` | Adds a world space to a planet's biome.
`PickPlayer` | Select the player character
`PickMenuPaperDoll` | Select the menu PaperDoll
`QuickSave` | performs a quicksave
`QuickLoad` | performs a quickload
`LoadMostRecent` | loads the most recent save
`SaveAndQuit` | performs a save and quits to main menu
`SaveAndQuitToDesktop` | performs a save and quits to desktop
`CreateFutureSave (createfuturesave)` | performs a save with a a future minor version
`MessageBoxSelect` | selects a button on the active message box
`SetPCMWorldSpace` | Sets the planet content to be preferred.
`CompleteResearch` | Completes a Research Project
`DumpReferences` | Writes out a file with info on all existing references.
`SetVsync` | Set Vsync Enable/Disable
`SetOutpostOverlay` | Given a Workshop Activator, sets its overlay for Outpost.
`PridBreak` | When a debugger is attached, this breaks execution & puts the prid target on the stack
`SetTeethCustomization (tcst)` | usage : tcst <color> \| list
`ExitPilotSeat` | Exits the pilot seat
`ExitShip (es)` | Exits the ship
`EnterAllSystems` | Mark all systems as entered to allow system inspect
`SetJewelryColor` | usage : jclr <color> \| list
`PromoteFromUnloaded (pfu)` | Promotes a reference from unloaded data for testing purposes
`WatchSaveLoad` | Sets a reference to be the save/load watched form for debug purposes
`DeriveGeneticParentAppearance` | Derives genetic appearance information from one NPC and applies it to an actor. If no source actor is provided, the player will be used.
`LODTest` | Distant LOD visual test tool
`TimeMultRequest` | tmr <GlobalMult> [PlayerMult] [Operation]
`TimeMultPrintRequests` | tmpr
`ToggleLightingHeatmap` | Toggles the lighting heatmap visualization
`CONSOLE_FUNCTION_START_PIANOROLL` | record player events for playback
`CONSOLE_FUNCTION_STOP_PIANOROLL (pianostop)` | stop recording
`CONSOLE_FUNCTION_PLAY_PIANOROLL (pianoplay)` | play back events
`DamageCellObjects` | Damage objects in a given cell.
`UseNearestTeleportDoor` | Use the nearest teleport door to the player
`TestUnrevertibleChanges` | Applies an unrevertible change to the selected ref in order to test form reconstruction
`MoveToNearestOverlay` | Move to the nearest overlay to the player
`ForcePCMBlockCoord` | Force the next block coord to be used

# Script Functions
`GetWantBlocking` | Returns 1 if the selected actor wants blocking, or 0 otherwise.
`GetDistance` | Get the distance between two objects.
`AddItem` | Adds the specified item to the inventory/container of the selected reference.
`SetEssential` | Sets the specified actor as essential(1) or non-essential(0).
`Rotate` | Rotates the object along the specified X/Y/Z axis at a given speed.
`GetLocked` | Is the ref object locked? Returns unlocked(0), locked(1), or broken(2).
`GetPos` | Returns the position of the reference along the specified X/Y/Z axis.
`SetPos` | Sets the position of the reference on the specified X/Y/Z axis.
`GetAngle` | Returns the angle of rotation for the reference on the specified X/Y/Z axis (in degrees).
`SetAngle` | Sets the angle of rotation for the reference along the specified X/Y/Z axis (in degrees).
`GetStartingPos` | Returns the starting position of the reference along the specified X/Y/Z axis.
`GetStartingAngle` | Returns the starting angle of the reference on the specified X/Y/Z axis (in degrees).
`GetSecondsPassed` | Returns the number of seconds that the current script has been running.
`Activate` | Forces the currently selected reference to activate the given reference. May specify NormalActivate(1) which triggers OnActivate block or ForceActivate(0) which skips script handlers.
`GetValue (GetAV)` | Get a reference's value for the given property. [player.getvalue luck]
`SetValue (SetAV)` | Set a reference's value for the given property. [player.setvalue luck, 75]
`ModValue (ModAV)` | Modify a reference's value for the given property. [player.modvalue luck, -10]
`SetAtStart` | Moves the selected reference to its starting location+rotation.
`GetCurrentTime` | Returns the current game hour (float value between 0.0 and 23.999).
`PlayGroup (PlaySeq)` | Play a Gamebryo sequence. [ref.PlaySeq Open]
`LoopGroup` | Forces the currently selected reference to loop the given AnimGroup.
`SkipAnim` | Not implemented.
`StartCombat` | Forces the currently selected reference to initiate combat with the provided actor.
`StopCombat` | Forces the currently selected reference to stop combat with whatever they're fighting.
`GetScale` | Returns the size scale for the currently selected reference.
`IsMoving` | Is the actor moving?
`IsTurning` | Is the actor turning?
`GetLineOfSight (GetLOS)` | Returns 1 if the currently selected reference can currently see the provided target, or 0 otherwise.
`AddSpell` | Adds the specified spell to the currently selected reference's list of spells.
`RemoveSpell` | Removes the specified spell to the currently selected reference's list of spells.
`Cast` | Forces the currently selected actor to cast the specified spell at the specified target.
`GetButtonPressed` | Gets which button is pressed, or returns -1 if no buttons are pressed.
`GetInSameCell` | Is the reference in the same cell? (Returns 1 for Yes, or 0 for No).
`Enable` | Enables the selected reference into the world.
`Disable` | Disables the selected reference from the world.
`GetDisabled` | Returns 1 if the selected reference is disabled, or 0 if it is not disabled.
`MenuPaused` | Returns 1 if the game is paused at a menu, or 0 if the game is not paused at a menu.
`PlaceAtMe` | Places a number of objects at the currently selected reference. [object][count][distance][direction][forcepersist]
`GetCameraShipSize` | Retrieve the ship size in context of ship cameras.
`GetDisease` | Does the ref object have a disease?
`FailAllObjectives` | Fail all of a quest's objectives
`GetClothingValue` | What is the clothing value for the ref object?
`SameFaction` | Are the two references in the same faction?
`SameRace` | Are the two references the same race?
`SameSex` | Are the two references the same sex?
`GetDetected` | Is the first reference detected by the second?
`GetDead` | Is the reference dead?
`GetItemCount` | How many of the specified item does the reference have?
`GetGold` | How much gold/currency does the specified reference have?
`GetSleeping` | Is the reference asleep?
`GetTalkedToPC` | Has this reference talked ot the PC before?
`Say` | Forces the selected actor to say to the player a message from the specified topic.
`SayTo` | Forces the selected actor to say to the given actor a message from the specified topic.
`ShowHelpMessage` | Display a UI message box (usually used for tutorials).
`StartQuest` | Tries to start the given quest (optionally can specify 1 after the quest to indicate a force-start).
`StopQuest` | Stops the given quest.
`GetQuestRunning (GetQR)` | Is the given quest running?
`SetStage` | Sets a quest stage using the Papyrus mechanisms to ensure fragments and stages don't fire off early if the quest isn't started.
`GetStage` | What stage is the given quest in?
`GetStageDone` | Is the given quest past the given stage?
`GetFactionRankDifference` | What is the difference in ranks between the specified references in the specified faction?
`GetAlarmed` | Is the reference in an alarmed state?
`IsRaining` | Is it raining?
`GetAttacked` | Has the reference been attacked?
`GetIsCreature` | Is the reference a creature?
`GetLockLevel` | What is the ref's lock level?
`GetShouldAttack` | Should the given reference attack the specified target?
`GetInCell` | Is the reference in the specified cell?
`GetIsClass` | Is the reference the specified class?
`GetIsRace` | Is the reference the specified race?
`GetIsSex` | Is the reference the specified sex?
`GetInFaction` | Is the reference in the specified faction?
`GetIsID` | Is the reference a ref to the specified base object?
`GetFactionRank` | What is the reference's rank in the specified faction?
`GetGlobalValue` | What is the value of the specifed global variable?
`IsSnowing` | Is it snowing?
`FastTravel (ft)` | Player Fast Travel to Marker
`GetRandomPercent` | Gives a random integer between 0 and 99 inclusive
`RemoveMusic` | Removes the specified currently playing music type.
`WouldBeStealing` | Check if taking a ref would be stealing by an actor
`GetLevel` | What is the reference's level?
`IsRotating` | Test if the act ref is rotating currently.
`RemoveItem` | Remove item from ref object.
`GetLeveledEncounterValue` | Gets an adjusted encounter level value for the called on ref.
`GetDeadCount` | How many of the specified creature/NPC are dead?
`AddToMap (ShowMap)` | Adds the specified map marker to the map (also optionally you can specify '1' after the map marker name to allow fast-travel to this marker).
`StartConversation` | Start a conversation [Bob.StartConversation Joe, SecretTopic]
`Drop` | Forces the reference to drop the specified item.
`AddTopic` | Adds a new top-level topic for the current reference.
`ShowMessage` | Display a Message Box -- a message box with at least 1 button that stops game time.
`SetAlert` | Set the alert flag (which makes an actor draw his weapons) for the currently selected ref to 0 or 1.
`GetIsAlerted` | Is the Actor in an alerted state?
`Look` | Forces the currently selected actor to look at the specified target (also optionally you can specify '1' after the target to force the actor to turn to its target).
`StopLook` | Stops forcing an actor to look at a target.
`EvaluatePackage (evp)` | Force actor to evaluate its current AI package.
`SendAssaultAlarm` | Calls an assult crime on the actor passed in or a faction if it is passed in.
`EnablePlayerControls (epc)` | 16 optional (0/1) values. movement\|fighting\|pov\|looking\|sneaking\|menu\|activate\|journal\|vats\|favorites\|running\|handscanner\|takeoff\|gravjump\|fartravel\|cruisemode ex: 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
`DisablePlayerControls (dpc)` | 16 optional (0/1) values. movement\|fighting\|pov\|looking\|sneaking\|menu\|activate\|journal\|vats\|favorites\|running\|handscanner\|takeoff\|gravjump\|fartravel\|cruisemode ex: 1 0 0 1 0 0 0 0 0 0 0 0 0 0 0 0
`GetPlayerControlsDisabled (gpc)` | 5 optional (0/1) values. movement\|fighting\|looking\|sneaking\|menu ex: 1 0 0 1 1
`GetHeadingAngle` | What is the angle of the target object relative to my current heading?
`PickIdle` | Picks an idle animation for the currently selected actor to play towards its current target.
`IsWeaponMagicOut` | Is the actor's weapon/magic drawn/drawing?
`IsTorchOut` | Does the actor have a torch pulled out?
`IsShieldOut` | Does the actor have a shield equipped? (If so its always out)
`CreateDetectionEvent` | Adds a new detection event for the specified actor (can also optionally specify '1' if the event is a sound event).
`IsActionRef` | Returns 1 if the specified reference is the current action-reference for the current reference, or 0 otherwise.
`IsFacingUp` | Is the actor's body facing up?
`GetKnockedState` | What is the actor's knocked out state? (0=Normal, 1=Knocked Out, 2=Knocked Down)
`GetWeaponAnimType` | What is the actor's weapon's animation type? (0=Unarmed, 1=One-handed weapon, 2=Two-handed weapon, 3=Bow weapon)
`IsWeaponSkillType` | What is the actor's weapon's skill? (0=Unarmed, 1=Blade, 2=Blunt, 3=Marksman)
`GetDistanceFromCelestialBody` | Get the distance from a celestial body. (Optional: 1 to get the distance from the surface, 0 to get it from the body center.
`IsWaiting` | Is the actor in a waiting state?
`IsIdlePlaying` | Is the reference playing an idle animation?
`CompleteQuest` | Sets the specified quest to the "completed" state.
`Lock` | Locks the selected reference to the specified lock level (can also specify 1 after the lock level to indicate LockAsOwner).
`UnLock` | Unlocks the selected reference (can also specify 1 to indicate UnlockAsOwner).
`IsIntimidatedbyPlayer` | Determine if the ref is currently intimidated by the player
`IsPlayerInRegion` | Is the player currently in the given region?
`GetActorAggroRadiusViolated` | Returns true if the actor is currently in a guard state because his aggro radius has been violated.
`GetCrimeKnown` | Returns 1 if the given crime (int) is known between the given criminal (actor) and victim (actor).
`SetEnemy` | Makes one faction an enemy (0) or neutral (1) to another faction.
`SetAlly` | Makes one faction an ally (0) or friend (1) of another faction.
`GetCrime` | Has the given actor committed a crime against the ref actor?
`IsGreetingPlayer` | Is the ref actor currently greeting the player?
`StartMisterSandMan` | Determine how many favor points it would cost to activate this reference.
`IsGuard` | Is this actor a guard?
`ReloadForm` | Reload the selected reference or specified form
`ReloadResources` | Reload resources belonging to the selected reference or specified form
`GetStaminaPercentage (GetStamina)` | Gets the ref actor's stamina as a percentage.
`HasBeenRead` | Has the reference (a book) been read by the player?
`GetDying` | Is the reference dying?
`GetSceneActionPercent` | Tells if a scene action is a precentage done only used for dialogue scene actions.
`WouldRefuseCommand` | Check if an actor would do a command for the player on a ref.
`SameFactionAsPC` | Is the reference in the same faction as the player?
`SameRaceAsPC` | Is the reference the same race as the player?
`SameSexAsPC` | Is the reference the same sex as the player?
`GetIsReference` | Is the given reference the same as this reference?
`SetFactionRank` | Sets the actor's rank in the given faction to the given value.
`ModFactionRank` | Modifies the actor's rank in the given faction by the given value.
`KillActor (kill)` | Kills the target actor.
`ResurrectActor (resurrect)` | Resurrects the target dead actor.
`IsTalking` | Test if an actor is currently talking.
`GetComponentCount` | How many of the specified components does the reference have?
`GetCurrentAIProcedure` | Gets the current AI procedure type.
`GetTrespassWarningLevel` | Gets the current tresspassing warning level.
`IsTrespassing` | Is the current reference actor trespassing?
`IsInMyOwnedCell` | Returns true if the currently referenced actor is in a cell that is owned by them.
`GetWindSpeed` | Get the current wind speed.
`GetCurrentWeatherPercent (getweatherpct)` | What is the current weather percent (only < 1 if transitioning from another weather).
`GetIsCurrentWeather (getweather)` | Returns true if the specified weather matches the current weather type.
`IsContinuingPackagePCNear` | Is the current actor continuing an AI package for the player?
`SetCrimeFaction` | Set the crime faction for a reference.
`GetIsCrimeFaction` | Determine if the crime faction of the ref is the same as the param.
`CanHaveFlames` | Can the current ref have flames on it?
`HasFlames` | Does the current ref have flames on it right now?
`AddFlames` | Adds flames onto the current ref.
`RemoveFlames` | Removes flames from the current ref.
`GetOpenState` | Get the given ref's open state.
`MoveToMarker (MoveTo)` | Moves the current ref to the given marker (with an optional X/Y/Z offset).
`GetSitting` | Is the reference sitting?
`GetFurnitureMarkerID` | Gets the furniture marker ID for the current furniture.
`GetIsCurrentPackage` | Is the actor currently running the specified package?
`IsCurrentFurnitureRef` | Is the ref actor currently using the given furniture ref?
`IsCurrentFurnitureObj` | Is the ref actor currently using any furniture matching the object name?
`SetSize (CSize)` | Shrink/Grow an actor. [player.shrink 0.0 or radius]
`RemoveMe` | Removes the item from a container or character's inventory and optionally places it into the given container.
`DropMe` | Drops the item from a container or character's inventory.
`GetFactionReaction` | Get the reaction value between the two provided factions.
`SetFactionReaction` | Sets the reaction value between the two provided factions to the specified value.
`ModFactionReaction` | Modifies the reaction value between the two provided factions by the specified amount.
`GetDayOfWeek` | Gets the current day of the week. Return values are 0-6 for mon-sun.
`IgnoreCrime` | Sets the current actor's "ignores crime" flag to either ignore crime (1) or don't ignore crime (0).
`GetTalkedToPCParam` | Has this reference talked to the PC before?
`RemoveAllItems` | Removes all items from this reference's inventory. Optionally places them into the specified container (can also specify 1 after the container to change ownership of the items, and another 1 after that to ignore container weight limits).
`WakeUpPC` | Wakes the PC up from sleeping after the specified number of hours (use '0' to wake the player up immediately).
`IsPCSleeping` | Is the player sleeping currently?
`IsPCAMurderer` | Is the player a murderer?
`SetCombatStyle (setcs)` | Set the actor's combat style.
`ReloadFile` | Reload the specified file
`SelectPlayerSpell (spspell)` | Equips the specified spell into the player's hand (0=Left, 1=Right).
`HasSameEditorLocationAsRef` | Is this ref's editor loc the same loc as the given one, taking into account any keyword filters?
`HasSameEditorLocationAsRefAlias` | Is this ref's editor loc the same loc as the given alias on our owner quest, taking into account any keyword filters?
`GetEquipped` | Does the actor have the specified item equipped?
`Wait` | Makes the current actor wait where they are (only works if they are using a Follow or Escort AI package).
`StopWaiting` | Makes the current actor stop waiting (only works if they are using a Follow or Escort AI package).
`IsSwimming` | Is the current actor swimming?
`ScriptEffectElapsedSeconds` | Gets the number of seconds elapsed for this script.
`SetCellPublicFlag (setpublic)` | Set public flag on cell. [setpublic MyCell 1]
`GetPCSleepHours` | Gets the number of hours (float) that the player is sleeping for.
`SetPCSleepHours` | Sets the number of hours (int) that the player is sleeping for.
`GetAmountSoldStolen` | Gets the amount of stolen things the player has sold.
`ModAmountSoldStolen` | Modifies the amount of stolen things that the player has sold.
`GetIgnoreCrime` | Is the current actor ignoring crime?
`GetPCExpelled` | Is the player currently expelled from the given faction?
`SetPCExpelled` | Set the player to be expelled (1) or allowed (0) in the given faction.
`GetPCFactionMurder` | Has the player murdered a member of the given faction?
`SetPCFactionMurder` | Sets (1) or clears (0) the status of whether the player has murdered a member of the given faction.
`GetPCEnemyofFaction` | Is the player currently an enemy of the given faction?
`SetPCEnemyofFaction` | Sets (1) or clears (0) the enemy status for the player with the given faction.
`GetPCFactionAttack` | Has the player attacked a member of the given faction?
`SetPCFactionAttack` | Sets (1) or clears (0) the status of whether the player has attacked a member of the given faction.
`StartScene` | Starts the Scene in a quest with the given ID.
`StopScene` | Stops the Scene in the Quest with a given id.
`GetDestroyed` | Is the current reference destroyed?
`SetDestroyed` | Sets whether the current reference is destroyed (1) or not destroyed (0).
`GetActionRef (getAR)` | Gets the ref ID for the current reference's action target.
`GetSelf (this)` | Gets the ref ID for the current reference.
`GetContainer` | Gets the ref ID for the current reference's container.
`GetForceRun` | Is the current actor being forced to run?
`SetForceRun` | Sets the current actor's force-run state (1=ForceRun, 0=Normal).
`GetForceSneak` | Is the current actor being forced to sneak?
`SetForceSneak` | Sets the current actor's force-sneak state (1=ForceSneak, 0=Normal).
`AdvancePCSkill (AdvSkill)` | Give the player the given amount of skill usage [advskill onehanded 100]
`AdvancePCLevel (AdvLevel)` | Bring up the level up menu so player can level.
`HasMagicEffect` | Determines whether or not the current reference is being affected by the given magic effect.
`GetDefaultOpen` | Returns 1 if this object is open by default.
`SetDefaultOpen` | A value of 1 will make the object open by default.
`ShowClassMenu` | Bring up the class menu in char gen.
`ShowLooksMenu (SLM)` | ShowLooksMenu no second parameter will bring up the Looks menu, parameter=1 the Haircut, parameter=2 the Plastic surgery
`Spawn` | Spawns a number of the given object.
`ShowNameMenu` | Bring up the class menu in char gen.
`SetOpenState` | A value of 1 will make the object open.
`ResetReference (RecycleActor)` | Optional destination reference.
`IsSpellTarget` | Determines whether or not the current reference is being affected by the given magic item.
`GetVATSMode` | Is the game in VATS mode currently?
`GetPersuasionNumber` | Gets the persuasion number for the current actor.
`GetVampireFeed` | Is the player in a Sandman condition?
`GetCannibal` | Is the player a Cannibal?
`GetIsClassDefault` | Is the player's class equal to the specified class default?
`GetClassDefaultMatch` | Is the current actor's class equal to the specified class default?
`GetInCellParam` | Is the reference in the specified cell?
`GetPlayerDialogueInput` | What is players last input to dialogue?
`GetCombatTarget` | Gets the current actor's combat target (ref ID).
`GetPackageTarget` | Gets the current actor's package target (ref ID).
`ShowSpellMaking` | Bring up the spellmaking menu.
`GetVatsTargetHeight` | Get the current VATS command limb 3d target delta height from the player.
`SetGhost` | A value of 1 will make the NPC act as a 'ghost'.
`GetIsGhost` | Returns 1 if the actor is acting as a 'ghost'.
`EquipItem (EquipObject)` | Makes the current actor equip the specified item (can optionally add '1' after the item to indicate a force-equip).
`UnequipItem (UnEquipObject)` | Makes the current actor unequip the specified item (can optionally add '1' after the item to indicate a force-unequip).
`SetClass` | Sets the specified class for the current actor.
`SetUnconscious` | A value of 1 will be unconscious.
`GetUnconscious` | Returns 1 if is unconscious.
`SetRestrained` | A value of 1 will be restrained.
`GetRestrained` | Returns 1 if is restrained.
`ForceFlee (Flee)` | Forces a actor to flee if destination or cell is passed in uses them
`GetIsUsedItem` | Is the current used item the specified base object?
`GetIsUsedItemType` | Is the current used item the specified base type?
`IsScenePlaying` | Tells if a scene on a quest is active.
`IsInDialogueWithPlayer` | True if actor is currently in a dialogue state with player.If no action actor then just if player is in dialogue
`GetLocationExplored` | Is the parameter location explored?
`SetLocationExplored` | Set or clear the location explored flag on the parameter location.
`ForceRefIntoAlias` | Force the calling ref into the specified alias on the scope quest.
`EmptyRefAlias` | Clear the ref currently in the specified alias on the scope quest.
`GetIsPlayableRace` | Is the reference a playable race?
`GetOffersServicesNow` | See if NPC is offering service in its current AI package.
`GetGameSetting (GetGS)` | Gets the value of the given GameSetting.
`StopCombatAlarmOnActor (SCAOnActor)` | Stop combat and alarms on this actor.
`HasAssociationType` | Is true if the ref has the association type with the actor that is passed in.
`HasFamilyRelationship (Family)` | Gets if the actor has a relationship to the actor.
`SetWeather (sw)` | Sets the active weather to the specified type
`HasParentRelationship (IsParent)` | Gets if the actor has a parent type relationship to the other actor.
`IsWarningAbout` | Gets if the actor is warning about the object or form list that was passed in.
`IsWeaponOut` | Returns whether the actor's weapon (2) or fists (1) are out. 0 if not.
`HasSpell` | Does the actor have the given spell?
`IsTimePassing` | Returns true if the player is sleeping, waiting, training, or traveling.
`IsPleasant` | Is the weather pleasant?
`IsCloudy` | Is the weather cloudy?
`TrapUpdate` | Run through the trap object and damage or push the actors that are colliding with it.
`ShowQuestObjectives (SQO)` | Shows the list of current quest objectives
`ForceValue (ForceAV)` | Does modav XXX (value - getav XXX). [player.forceav luck 25]
`IncrementPCSkill (IncPCS)` | Increase the player's skill by one point. [IncrementSkill onehanded]
`DoTrap` | Perform a trap's effects on the current reference.
`EnableFastTravel (EnableFast)` | Sets if a player can fast travel from anywhere currently in the game.
`IsSmallBump` | Test if the act ref is doing a small bump reaction used to give different dialogue.
`GetParentRef` | Gets the parent ref ID for the parent of this reference.
`AnimAction_EffectHasKeyword` | A magic effect has either started or ended on the Target reference. Does it have a specific keyword?
`GetBaseValue (GetBaseAV)` | Get the base value of a property on the reference. [player.getbasevalue luck]
`IsOwner` | Get the ownership of the ref.
`SetOwnership` | Sets the ownership of the ref.
`IsCellOwner` | Get the ownership of the given cell.
`SetCellOwnership` | Sets the ownership of the given cell.
`IsHorseStolen` | Is this horse stolen?
`SetCellFullName` | Changes the given cell's full name to the provided new name.
`SetActorFullName` | Sets the current actor's full name to the provided new name.
`IsLeftUp` | Is the actor's left side facing up? Used for quadrapeds.
`IsSneaking` | Is the actor sneaking?
`IsRunning` | Is the actor running?
`GetFriendHit` | How many times has the player hit this actor as a friend?
`IsInCombat` | Is this actor currently in combat?
`SetPackDuration (SPDur)` | Set the duration of an AI package if you want to end in under an hour.
`PlayMagicShaderVisuals (PMS)` | Plays the given magic shader on the current reference.
`PlayMagicEffectVisuals (PME)` | Plays the given magic effect on the current reference.
`StopMagicShaderVisuals (SMS)` | Stops the given magic shader on the current reference.
`StopMagicEffectVisuals (SME)` | Stops the given magic effect on the current reference.
`ResetInterior` | Resets the provided cell to its original state.
`IsAnimPlaying` | Is the provided animation playing on the current actor?
`SetActorAlpha (SAA)` | Sets the actor's alpha fade percentage.
`EnableLinkedPathPoints` | Enables path grid linked path points for the current reference.
`DisableLinkedPathPoints` | Disables path grid linked path points for the current reference.
`IsInInterior` | Is the reference in an interior cell?
`ForceWeather (fw)` | Forces the active weather to the specified type, without transition.
`ToggleActorsAI` | Toggles AI on/off for the current actor.
`IsActorsAIOff` | Is AI processing enabled for the current actor?
`IsWaterObject` | Water condition used for drinking animation.
`GetPlayerAction` | Determines what is the recent action that the actor is reponding to from the player.
`IsActorUsingATorch` | Is the current actor using a torch?
`SetLevel` | Sets an actors level and recalcs him if he is not the player.
`ResetFallDamageTimer` | Reset the fall timer to stop fall damage on an actor.
`IsXBox` | Is current platform the XBox?
`GetInWorldspace` | Is the reference in the specified cell?
`ModPCMiscStat (ModPCMS)` | Modifies the provided player's misc. stat by the given amount.
`GetPCMiscStat (GetPCMS)` | Gets the value of the provided misc. stat for the player.
`GetPairedAnimation (GPA)` | See if this reference is currently playing a paired animation.
`IsActorAVictim` | Is the current actor the victim of a crime?
`GetTotalPersuasionNumber` | Gets the total persuasion change number for the current actor.
`SetScale` | Set the scale of an object
`ModScale` | Modify the scale of an object
`GetIdleDoneOnce` | Is the current actor's idle done once?
`KillAllActors (killall)` | Kills all actors in the loaded area (and optionally specify the killer).
`GetNoRumors` | Checks the no rumors flag on the actor.
`SetNoRumors` | Sets the no rumors flag on the actor.
`Dispel` | Dispels the given spell from the specified target.
`GetCombatState` | Test the state of this actor in the combat manager.
`TriggerHitShader (ths)` | Triggers the "you're being hit" shader on the screen as if the player were taking damage. Optionally allows you to specify the strength of the hit.
`GetWithinPackageLocation` | Determine whether the subject is within this package location.
`Reset3DState` | Resets the animation and physics for this reference.
`IsRidingMount` | Returns whether or not the actor is riding a mount.
`DispelAllSpells` | Dispels all magic effects coming from spells on the current actor.
`IsFleeing` | Determine if an actor is currently fleeing from something.
`AddAchievement` | Add an achievement to the player's profile.
`DuplicateAllItems` | Duplicates and copies all items from the current reference's inventory/container into the given target inventory/container.
`IsInDangerousWater` | Is the current actor in water marked as dangerous?
`EssentialDeathReload` | Displays a message to the player that an essential character has died. "With this character's death, the thread of prophecy is severed. Restore a saved game to restore the weave of fate, or persist in the doomed world you have created."
`SetShowQuestItems` | Shows (1) or hides (0) quest items in the inventory.
`DuplicateNPCStats` | Copies the stats and level of the current actor from the specified actor.
`ResetHealth` | Resets the health of the current reference to full.
`SetIgnoreFriendlyHits (sifh)` | Set whether an actor should ignore friendly hits (0-no, 1-yes)
`GetIgnoreFriendlyHits (gifh)` | See if an actor is ignoring friendly hits
`IsPlayersLastRiddenMount` | Is this the last mount that the player has ridden on?
`SetActorRefraction (sar)` | Sets the amount of refraction applied to the current actor.
`SetItemValue` | Sets the sell-value for the current item.
`SetRigidBodyMass` | Sets the Havok mass for an object.
`ShowViewerStrings (svs)` | Prints the current object's viewer strings into the console.
`ReleaseWeatherOverride (rwo)` | Release the weather currently overriding the system.
`SetAllReachable` | Sets the given path as "all points reachable".
`SetAllVisible` | Sets the "all points visible" flag on the current actor.
`SetNoAvoidance` | Sets the "no avoidance" flag on the current actor.
`SendTrespassAlarm` | Send a crime alarm. It is sent by the one commiting the crime.
`SetSceneIsComplex` | If 1 then the scene is complex enough to turn on aggressive optimizations.
`Autosave` | Triggers an auto-save to occur.
`StartMasterFileSeekData` | Starts the masterfile seek data.
`DumpMasterFileSeekData` | Dumps out the masterfile seek data.
`IsActor` | Is the current reference an actor?
`IsEssential` | Is the current actor marked as essential?
`PreloadMagicEffect` | Preloads a magic effect so that when it is later triggered, it can play instantly without having to load first.
`ShowDialogSubtitles` | Enables (1) or disables (0) showing subtitles for dialogue.
`SetPlayerResistingArrest` | Sets the player to resisting arrest which makes guards attack him.
`IsPlayerMovingIntoNewSpace` | Is the player moving to a new area that they haven't visited before?
`GetIsCurrentLocation` | Is the ref currently in the given location or one of its children?
`GetIsCurrentLocationAlias` | Is the ref currently in the given location of our owner quest?
`GetTimeDead` | Get the amount of time that has passed since this actor was dead.
`HasLinkedRef` | Does the ref object have the given linked ref?
`GetLinkedRef` | Gets the ref ID of the ref object's linked ref.
`DamageObject (do)` | Applies the provided amount of damage to the current reference.
`IsChild` | Is the reference a child?
`GetStolenItemValueNoCrime` | Get the value of player stolen items that no crime was reported for.
`GetLastPlayerAction` | Return the most recent action taken by the player.
`IsPlayerActionActive` | Is the provided action in the player's active actions list?
`SetTalkingActivatorActor` | Sets a new talking activator actor reference for the current reference.
`IsTalkingActivatorActor` | Gets the talking activator actor reference for the current reference.
`ShowBarterMenu (sbm)` | Bring up the bartering menu.
`IsInList` | Is the reference in the specified list?
`GetStolenItemValue` | Get the value of player stolen items which had crimes was reported for them.
`AddPerk` | Adds the given perk to the current actor.
`GetCrimeGoldViolent (getviolent)` | Gets what the violent crime gold is for the actor in a particular faction.
`GetCrimeGoldNonviolent (getnonviolent)` | Gets what the nonviolent crime gold is for the actor in a particular faction.
`ShowRepairMenu (srm)` | Bring up the repair menu in dialog.
`IsOwnedBy` | Check to see if the action ref is owned by the param actor.
`AddNote (AN)` | Add a new note to the player.
`GetCommandDistance` | Get how far form the player the actor doing the command is.
`GetCommandLocationDistance` | How far from the player is the location of the command action?
`AddToFaction (Addfac)` | Adds the current actor to the given faction with the specified faction rank.
`RemoveFromFaction (Removefac)` | Removes the current actor from the given faction.
`DamageValue (DamageAV)` | Damage the value of the given property.
`RestoreValue (RestoreAV)` | Restore the value of the given property.
`TriggerHUDShudder (hudsh)` | Trigger shudder effect on HUD.  Params=Intensity/Duration.
`GetObjectiveFailed` | Is the given objective flagged as failed?
`SetObjectiveFailed` | Sets the given objective flagged as failed (1) or un-failed (0).
`SetGlobalTimeMultiplier (sgtm)` | Sets the global time multiplier for the world. Values greater than 1 speed up time, whereas values between 0 and 1 slow down time.
`GetHitLocation` | What BGSBodyPartDefs::LIMB_ENUM was hit. -1 = none, 0 = torso, ...
`IsPC1stPerson (pc1st)` | Is the player playing in 1st person mode?
`PurgeCellBuffers (pcb)` | Forcibly unloads all unattached cells in cell buffers.
`PushActorAway` | Push one actor away from another using a given force.
`SetActorsAI` | Sets AI processing for the current actor to either enabled (1) or disabled (0).
`ClearOwnership` | Removes ownership information for the current reference.
`GetCauseofDeath` | What killed the actor?
`ShowDependencyGraph (sdg)` | Show the dependency graph for the specified object
`IsWeaponInList` | Is the current weapon in the form list
`PlayIdle` | Play this idle on the current actor.
`ApplyImageSpaceModifier (imod)` | Adds an imagespace modifier to the active list
`RemoveImageSpaceModifier (rimod)` | Removes an imagespace modifier from the active list
`IsBribedbyPlayer` | Is the actor ref in a bribed state with the player?
`GetRelationshipRank` | Get the rank of the current relationship between two NPCs.
`SetRelationshipRank` | Set the rank between two NPC's.
`SetCellImageSpace` | Sets the given imagespace for the provided cell.
`GetStrongestEnemyHasKeyword (gsehk)` | Tests if the player's strongest enemy has the given Keyword.
`GetVATSValue` | Gets the specified VATS value for the given VATS value query.
`IsKiller` | Is the specified actor the killer for the current actor?
`IsPlayerInShipTargetingMode` | Is Player in Ship Targeting Mode.
`GetFactionCombatReaction` | Return what kind of faction combat relation the two factions have.
`IsShipTargetInShipTargetingMode` | Is the specified object the ship currently targeted in Ship Targeting Mode.
`EvaluateSpellConditions (esc)` | Recompute the active/inactive status of all of the active effects in the list by reevaluating their conditions.
`ToggleMotionBlur (tmb)` | Toggle Motion Blur for the selected reference
`Exists` | Does the current reference exist (1), or is it null (0)?
`GetGroupMemberCount` | Gets how many members are in the current actor's combat group.
`GetGroupTargetCount` | Gets how many targets are in the current actor's combat group targets list.
`SetObjectiveCompleted` | Set objective completion status: 0-Off, 1-On
`SetObjectiveDisplayed` | Set objective displayed status: 0-Off, 1-On
`GetObjectiveCompleted` | Get objective completion status: 0-Off, 1-On
`GetObjectiveDisplayed` | Get objective displayed status: 0-Off, 1-On
`SetImageSpace` | Sets a new given imagespace.
`PipboyRadio (prad)` | Control the Pipboy radio. Enable, Disable, Tune
`RemovePerk` | Removes the given perk from the current actor.
`DisableAllActors (DisAA)` | Disable all other actors than our selected actor. If selected is not an actor then disable all actors.
`GetIsFormType` | Is the current reference an instance of the form type specified?
`GetIsVoiceType` | Does the reference have the specified voice type?
`GetPlantedExplosive` | Does the current actor have the AI package of a planted explosive?
`CompleteAllObjectives` | Complete all of a quest's objectives
`IsScenePackageRunning` | Is the reference actor running a scene package?
`GetHealthPercentage` | Gets the current actor's health as a percentage of its total health.
`GetActiveBoostDuration` | Get the duration in seconds that the current actor's spaceship has been boosting for if the boosters are active, or zero if they aren't.
`GetIsObjectType` | Test if a reference is of the object type passed in.
`PlayerVisualDetection (PVD)` | Gets the player's visual detection value for the current ref.
`PlayerAudioDetection (PAD)` | Gets the player's audio detection value for the current ref.
`ExitGame (exit)` | Exits the game.
`GetIsCreatureType` | Is this reference the specified creature type?
`HasKey` | Determines whether a actor has a key to the reference.
`IsFurnitureEntryType` | Is the actor's current furniture marker of the given entry type?
`ShowWarning` | Shows the player a warning message-box containing the given text.
`EnterTrigger` | Triggered when entering a function.
`MarkForDelete` | Marks a ref for deletion.
`SetPlayerAIDriven` | Turn control of the player driven by AI on and off.
`GetInCurrentLocationFormList` | Is the ref currently in the given location or one of its children?
`GetInZone` | Is the current ref in the specified zone?
`GetVelocity` | Gets Velocity on a reference
`GetGraphVariableFloat` | Get the float value in the specified behavior graph variable on the calling ref.
`HasPerk` | Does the current actor have the given perk?
`GetFactionRelation` | Gets the faction fight reaction value between the current actor and the given actor.
`IsLastIdlePlayed` | Is the current actor's last-played idle animation the given one?
`SetNPCRadio (snr)` | Enable/Disable NPC radio playback: 0-Off, 1-On
`SetPlayerTeammate` | Makes the current actor a teammate of the player (1) or removes their teammate status (0).
`GetPlayerTeammate` | Is the current actor a teammate of the player?
`GetPlayerTeammateCount` | How many teammates does the player currently have?
`OpenActorContainer` | Open the container of a teammate so you can take things or add them.
`ClearFactionPlayerEnemyFlag` | Set that the Player isn't an enemy of the given faction.
`ClearActorsFactionsPlayerEnemyFlag` | Sets that the Player isn't an enemy of any factions that are currently mad at them.
`GetActorCrimePlayerEnemy` | Is this actor an enemy of the player because of a crime being committed?
`GetCrimeGold` | Gets what the crime gold is for the actor in a particular faction.
`SetCrimeGold` | Sets the value of the crime gold for the actor in a particular faction by the amount passed in.
`ModCrimeGold` | Mods the value of the crime gold is for the actor in a particular faction by the amount passed in.
`GetPlayerGrabbedRef` | Gets the ref ID of the object that the player is currently grabbing.
`IsPlayerGrabbedRef` | Is the player grabbing the current ref?
`PlaceLeveledActorAtMe` | Spawns and places a new instance of a leveled actor at the player's location.
`GetKeywordItemCount` | How many items with the specified keyword does the reference have?
`GetBroadcastState` | Returns the current broadcast state of the radio station.
`SetBroadcastState` | Sets the current broadcast state of the radio station.
`StartRadioConversation` | Forces a radio station to play a conversation with the given (optional) topic. If no topic is present a default radio topic will be used.
`GetDestructionStage` | Returns the destruction stage for the current reference.
`ClearDestruction` | Clear the destruction done to the selected reference.
`CastImmediateOnSelf (cios)` | Forces the current actor to cast the given spell on themselves (for making them use certain abilities).
`GetIsAlignment` | Does the current actor have the specified karma alignment? (0=Good, 1=Neutral, 2=Evil, 3=VeryGood, 4=VeryEvil)
`ResetQuest` | Resets the specified quest.
`SetQuestDelay` | Adds a specified script processing delay for the given quest.
`IsProtected` | Is the ref object protected?
`GetThreatRatio` | Calculates the ratio between the combat strength of the specified actor to the combat strength of the current actor.
`MatchFaceGeometry` | Changes the face geometry of the specified actor to match that of the current actor.
`GetIsUsedItemEquipType` | Is the current item's equip slot the given slot type?
`GetPlayerName` | Displays the player name entry UI so the player can enter their character name.
`FireWeapon` | Fires the given weapon using the specified ammo.
`PayCrimeGold` | Has the ref actor pay the fine for his crime for a particular faction.
`GetPlayerActivated` | See if a Actor has been recently activated by the player.
`MatchRace` | Changes the race of the specified actor to match that of the current actor.
`GetFullyEnabledActorsInHigh` | Get the number of fully enabled high-process actors.
`SexChange` | Change the selected npc from a male to a female or female to a male.
`IsCarryable` | Returns true if the ref can be picked up and added to a container.
`GetConcussed` | Is the current actor concussed?
`SetZoneRespawns` | Sets whether the given zone respawns (1) or not (0).
`GetBiomeScanPercent` | Returns the biome scan percentage of this object type. 0 if it's not part of this biome.
`GetMapMarkerVisible` | Is the current ref a visible map marker?
`ResetInventory` | Resets the inventory of the current actor.
`PlayerKnows` | Is the Known flag set on the given form?
`GetPermanentValue` | Get the value of a property ignoring temporary modifiers. [player.getpermanentvalue luck]
`EPMagic_EffectIsDetrimental` | The passed in reference is a temp reference whose referring object is a Magic Effect. Is the Magic Effect marked Detrimental?
`GoToJail` | Sends the Player to "jail" and takes his stuff if param tells it to.
`CanPayCrimeGold` | Function to see if ref actor can pay the fine for his crimes to a faction.
`ServeTime` | Get actor out of jail by serving his time.
`GetDaysInJail` | How many days does the current ref have to serve in jail?
`EPAlchemyGetMakingPoison` | Unused.
`EPAlchemyEffectHasKeyword` | Unused.
`ShowAllMapMarkers (tmm)` | Shows/hides map markers (1 shows, 0 hides)(1 travel(default), 0 no travel)(1 all, 0 all but hidden(default)).
`GetAllowWorldInteractions` | Sets arReturnValue to true (1.0) if the reference is NOT an actor with a package with its "World Interactions" flag unchecked.
`ResetAI` | Resets the AI package on the current actor.
`SetRumble` | Creates rumble in the controller (left motor) (right motor) (duration)
`GetPerkRank` | Returns the rank of a given perk on an actor.
`GetLastHitCritical` | Was the last hit against this actor a critical hit?
`AddMusic` | Adds the specified music to the music playlist.
`LastCrippledCondition` | Get last crippled actor value on an actor.
`HasSharedPowerGrid (spg)` | Does given reference share the same power grid?
`IsCombatTarget` | Is the current actor in combat with the specified actor?
`TriggerScreenBlood (tsb)` | Trigger screen blood
`GetVATSRightAreaFree` | Check to see if a VATS camera can fit on the right side.
`GetVATSLeftAreaFree` | Check to see if a VATS camera can fit on the left side.
`GetVATSBackAreaFree` | Check to see if a VATS camera can fit on the back side.
`GetVATSFrontAreaFree` | Check to see if a VATS camera can fit on the front side.
`GetIsLockBroken` | Is this lock broken?
`NotUsed` | Not used.
`IsWindowsPC` | Is current platform PC?
`GetVATSRightTargetVisible` | Is the target visible from the right?
`GetVATSLeftTargetVisible` | Is the target visible from the left?
`GetVATSBackTargetVisible` | Is the target visible from the back?
`GetVATSFrontTargetVisible` | Is the target visible from the front?
`AttachAshPile` | Places an ash pile at the selected actor's feet.
`SetCriticalStage` | Sets the stage for the critical effect on the actor.
`IsInCriticalStage` | Is the actor in the critical stage?
`RemoveFromAllFactions` | Removes the selected actor from all factions.
`GetXPForNextLevel` | How many experience points does the player need to reach the next level?
`ForceSave` | Forces the game to create a save.
`GetInfamy` | Returns the number of total crime gold player has every gotten with a particular faction.
`GetInfamyViolent` | Returns the number of total Violent crime gold the player has every gotten with a particular faction.
`GetInfamyNonViolent` | Returns the number of total Non Violent crime gold player has every gotten with a particular faction.
`GetTypeCommandPerforming` | Get the type of the command an actor is peforming.
`Sin` | Calcuates the sine (or optionally, if you pass '1', the arcsine) of the given angle.
`Cos` | Calcuates the cosine (or optionally, if you pass '1', the arc-cosine) of the given angle.
`Tan` | Calcuates the tangent (or optionally, if you pass '1', the arctangent) of the given angle.
`Sqrt` | Calculates the square root of the given value.
`Log` | Calculates the logarithm of the given value in the specified base (or in base e if no base is specified).
`Abs` | Calculates the absolute value of the given value.
`GetQuestCompleted (GetQC)` | Has the given quest been completed?
`GetSpeechChallengeSuccessScene` | Get success value of the player current speaking topic.
`PipBoyRadioOff` | Disables the radio for the player.
`AutoDisplayObjectives` | Set the flag in the HUD for showing the quest objectives.
`IsGoreDisabled` | Is gore disabled?
`SetMinimalUse` | Set the door to minimal use and refresh the quest targets since the door's changed status may alter pathing to the quest targets.
`IsSceneActionComplete` | Tells if a scene action has been completed.
`ShowQuestStages (SQS)` | Prints quest stages for the specified quest into the console.
`ForceRadioStationUpdate (FRSU)` | Forces an update of the radio station's broadcasting state.
`GetActorsInHigh` | Gets the number of actors that are in the "high" processing list currently.
`HasLoaded3D` | Has the 3D geometry for this reference fully loaded?
`DisableAllMines` | Disables all mines that are currently running.
`SetLastExtDoorActivated` | Sets the specified door to be the player's last-used exterior door so we know where the player came in from.
`KillQuestUpdates (KQU)` | Removes all quest updates from the UI.
`IsImageSpaceActive` | Is the specified imagespace currently active?
`HasKeyword` | Does the ref object use the keyword in the parameter data?
`HasRefType` | Does the ref object use the location ref type in the parameter data?
`LocationHasKeyword` | Does the ref object's current location use the keyword in the parameter data?
`LocationHasRefType` | Does the ref object's current location use the location ref type in the parameter data?
`CreateEvent` | Create a script event and send it to the story event manager.
`GetIsEditorLocation` | Is the ref's editor loc in the given location or one of its children?
`GetIsAliasRef` | Is the ref the given alias ref in our owner quest?
`GetIsEditorLocationAlias` | Is the ref's editor loc in the given alias location of our owner quest?
`IsSprinting` | Is the current actor sprinting?
`IsBlocking` | Is the current actor blocking?
`HasEquippedSpell (hasspell)` | Indicate whether or not the actor reference has a spell equipped in the given casting source.
`GetCurrentCastingType (getcasting)` | Get the Casting Type of the actor's currently equipped spell.
`GetCurrentDeliveryType (getdelivery)` | Get the Delivery Type of the actor's currently equipped spell.
`EquipSpell` | Equip the given spell to an actor's specified casting source.
`GetAttackState` | 0 = None, 1 = Draw, 2 = Swing, 3 = Hit, 4 = Next Attack, 5 = Follow Through, 6 = Bash
`GetAliasedRef` | Gets the ref currently in the given alias on our owner quest.
`GetEventData` | Get the event data for a story event.
`IsCloserToAThanB` | Determine if a reference is closer to A than B.
`LevelMinusPCLevel` | Subtract the player level from the target level and return the result.
`IsBleedingOut` | Is the reference actor bleeding out?
`UnlockWord` | Unused.
`TeachWord` | Unused.
`AddToContainer` | Add the reference called on to the given container reference.
`GetRelativeAngle` | Checks the relative angle between two references along the passed axis.
`SendAnimEvent (sae)` | Send an event to the animation graph and an optional animation.
`GetMovementDirection` | Get the movement direction for an actor.
`IsInScene` | Tells if the actor is in any scene.
`GetRefTypeDeadCount` | Get number of the given ref count currently dead in the given location.
`GetRefTypeAliveCount` | Get number of the given ref count currently alive in the given location.
`ApplyHavokImpulse` | Applies an impulse of the passed magnitude to the reference along a passed axis.
`GetIsFlying` | Gets whether or not the actor is flying.
`IsCurrentSpell` | Indicate whether or not the actor reference has the specified spell equipped in the given casting source.
`SpellHasKeyword` | Does the spell the actor currently want to cast have the given keyword?
`GetEquippedItemType` | Returns the equip item ID for the item equipped in the player's hand.
`GetLocationAliasExplored` | Is the parameter location alias explored?
`SetLocationAliasExplored` | Set or clear the location explored flag on the parameter location.
`GetLocationAliasRefTypeDeadCount` | Get number of the given ref count currently dead in the given location alias.
`GetLocationAliasRefTypeAliveCount` | Get number of the given ref count currently alive in the given location alias.
`IsWardState` | Indicate whether or not the actor reference's ward state is the one provided.
`IsInSameCurrentLocationAsRef` | Is this ref's current loc the same loc as the given one, taking into account any keyword filters?
`IsInSameCurrentLocationAsAlias` | Is this ref's current loc the same loc as the given alias on our owner quest, taking into account any keyword filters?
`LocationAliasIsLocation` | Is the given loc alias filled the specified location?
`GetKeywordDataForLocation` | Gets the data on the given location for the given keyword.
`SetKeywordDataForLocation` | Sets the data on the given location for the given keyword to the given value.
`GetKeywordDataForAlias` | Gets the data on the given loc alias for the given keyword.
`SetKeywordDataForAlias` | Sets the data on the given loc alias for the given keyword to the given value.
`LocationAliasHasKeyword` | Does the location in the given loc alias have the given keyword?
`IsNullPackageData` | Determine whether a piece of package data currently contains a null value (e.g. a target that specifies "linked ref" in a package on an actor with no linked ref).
`GetNumericPackageData` | Get the floating-point value of a numeric package data variable.
`IsPlayerRadioOn` | Unused.
`GetPlayerRadioFrequency` | Unused.
`GetHighestRelationshipRank` | What is the actor's highest relationship rank?
`GetLowestRelationshipRank` | What is the actor's lowest relationship rank?
`HasAssociationTypeAny` | Does the actor have any relationships of the given type?
`HasFamilyRelationshipAny` | Does the actor have any family relationships?
`GetPathingTargetOffset` | For Idle selection, fetch the deired pathing offset.
`GetPathingTargetAngleOffset` | For Idle selection, fetch the deired pathing rotation offset.
`GetPathingTargetSpeed` | For Idle selection, fetch the desired pathing speed.
`GetPathingTargetSpeedAngle` | For Idle selection, fetch the deired pathing rotation offset.
`GetMovementSpeed` | Fetch the current movement speed.
`GetInContainer` | Is this ref currently in the param ref?
`IsLocationLoaded` | Is the parameter location loaded?
`IsLocationAliasLoaded` | Is the parameter loc alias loaded?
`IsDualCasting` | Indicate whether or not the actor reference is dual-casting.
`DualCast` | Cause the reference actor to dual-cast the given spell.
`GetVMQuestVariable` | Gets a value out of a Papyrus script (called on a specific reference or quest).
`GetCombatAudioDetection (adcombat)` | Check the actor's audio detection value against his combat target to find out if they can hear their target.
`GetCombatVisualDetection (vdcombat)` | Check the actor's visual detection value against his combat target to find out if they can see their target.
`IsCasting` | Tests if the actor is currently casting a spell to be used by the animation system in idle manager.
`GetFlyingState` | Gets the actor flight state.
`SetCommandState` | Turns on or off the actor being in a doing a favor for the player state.
`IsInFavorState` | Tests if the actor is in a favor state.
`HasTwoHandedWeaponEquipped` | Sets arReturnValue to true (1.0) if the ref has a two-handed weapon equipped.
`IsFurnitureExitType` | Is the actor's current furniture marker of the given exit type?
`IsInFriendStatewithPlayer` | Determine if the ref is currently in a friend state with the player.
`GetWithinDistance` | Checks to see if the called on ref is the given distance from the given ref.
`GetValuePercent` | Gets the specified actor value for the called on actor as a percent of the max.
`IsUnique` | Checks if the called on ref is an actor to a unique NPC.
`GetLastBumpDirection` | For Idle selection, fetch the direction the actor was bumped from.
`CameraShake` | Plays a screen shake.
`GetInfoChallangeSuccess` | Get success value of the player current speaking info.
`GetIsInjured` | Gets whether or not the actor is injured.
`GetIsCrashLandRequest` | Gets whether or not the actor has a crash landing request.
`GetIsHastyLandRequest` | Gets whether or not the actor has a hasty landing request.
`UpdateQuestInstanceGlobal` | Updates the value for the given global in the given quests current instance data.
`SetAllowFlying` | Tests and spends favor points if the player has the right amount of favor points with the actor ref.
`IsLinkedTo` | Is the calling ref linked to the given one?
`GetKeywordDataForCurrentLocation` | Gets the data on the calling ref's current location for the given keyword.
`GetInSharedCrimeFaction` | Test if the actor shares the same crime faction as another actor.
`GetBribeAmount` | Get the amount of gold it would take the player to bribe the actor.
`GetBribeSuccess` | Test if the actor can be bribed by the player.
`GetIntimidateSuccess` | See if the player can intimidate the actor.
`GetArrestedState` | Test if the ref actor is being arrested.
`GetArrestingActor` | Test if the act ref is arresting another actor.
`ClearArrestState` | Turn off the actor's Arrested state.
`HasVMScript` | Checks to see if the given script is attached to the given reference.
`GetVMScriptVariable` | Gets a value out of a Papyrus script.
`GetWorkshopResourceDamage` | Gets the workshop resource damage.
`ShowDockedSpaceships` | Shows all the spaceships docked with the selection.
`ForceLocationIntoAlias` | Force the given location into the specified alias on the scope quest.
`HasValidRumorTopic` | See if a Ref has a valid Rumor topic to say for a particular quest or for any quest.
`SetHorseActor` | Set the actor's horse to be used.
`PlayReferenceEffect (pre)` | Apply a BGSArtObject visual effect to a reference.
`StopReferenceEffect (sre)` | Stop playing a BGSArtObject visual effect on a reference.
`PlayShaderParticleGeometry (pspg)` | Start the given shader particle geometry.
`StopShaderParticleGeometry (sspg)` | Stop the given shader particle geometry.
`ApplyImageSpaceModifierCrossFade (imodcf)` | Adds a crossfade imagespace modifier to the active list
`RemoveImageSpaceModifierCrossFade (rimodcf)` | Remove a crossfade imagespace modifier from the active list
`IsAttacking` | See if an actor is attacking.
`IsPowerAttacking` | See if an actor is power attacking.
`IsLastHostileActor` | See if an actor is the last hostile actor.
`GetGraphVariableInt` | Get the int value in the specified behavior graph variable on the calling ref.
`GetDockerOrientation` | Get the orientation of the first docker of a spaceship.
`PlayImpactEffect (pie)` | Executes effects from an impact data set.
`ShouldAttackKill` | See if an actor should be able to kill the other actor with an attack.
`SendStealAlarm (steal)` | Send that the ref is being stolen by the param actor.
`GetActivationHeight` | Get the value of the activation level for the ref actor.
`SSLPI_ReplacePayloadHasKeyword` | See if the given BGSKeyword is in the Extra Forms in arData.
`WornHasKeyword` | If the reference has inventory, do any of the worn items have the given keyword?
`GetPathingCurrentSpeed` | For Idle selection, fetch the current pathing speed
`GetPathingCurrentSpeedAngle` | For Idle selection, fetch the current pathing rotation offset
`KnockAreaEffect (kae)` | Executes a knock effect on an area.
`InterruptCast` | Perform InterruptCast on the target reference or actor.
`AddFormToFormList` | Adds a form to a form list in game.
`RevertFormList` | Removes all script added forms from a form list.
`AddFormToLeveledList` | Adds a form to a leveled list in game.
`RevertLeveledList` | Removes all script added forms from a leveled list.
`GetWorkshopObjectCount` | Get the number of a given item placed in a workshop.
`InstantUndock` | Instantly undock from all possible ships
`EPMagic_SpellHasKeyword` | The passed in reference is a temp reference whose referring object is a MagicItem. Does it have the given keyword?
`GetNoBleedoutRecovery` | Does the reference actor have the No Bleedout Recovery flag set?
`SetNoBleedoutRecovery` | Set or clear the No Bleedout Recovery flag on the reference actor.
`EPMagic_SpellHasSkill` | The passed in reference is a temp reference whose referring object is a MagicItem. Does the costliest effect in the spell have the specified skill?
`IsAttackType` | Check if the actor's current attack type is the specified keyword.
`IsAllowedToFly` | Is the reference actor allowed to fly?
`HasMagicEffectOrSpellKeyword` | Does the ref object use the keyword in the parameter data?
`IsCommandedActor` | Is the ref object an actor who has a commander?
`IsStaggered` | Is the ref object an actor who is staggered?
`IsRecoiling` | Is the ref object an actor who is recoiling?
`HasScopeWeaponEquipped` | Returns true (1.0) if the actor has a weapon with a scope equipped.
`IsPathing` | Is the ref object an actor who is pathing?
`GetShouldHelp` | Should the given reference help the specified target?
`HasBoundWeaponEquipped` | Returns true (1.0) if the ref has a bound weapon equipped.
`GetCombatTargetHasKeyword (gcthk)` | Is the ref object an actor who has a combat target with the keyword?
`UpdateLevel` | Update the player's level based on current skill usage amounts.
`GetCombatGroupMemberCount (gcgmc)` | Get the member count for the actor's combat group
`IsIgnoringCombat` | Determine if the ref is ignoring combat.
`GetLightLevel (gll)` | Get the light level on an actor.
`SavePCFace (spf)` | Save the PC face data on an actor.
`SpellHasCastingPerk` | The passed in reference is a temp reference whose referring object is a MagicItem. Does it have the given keyword?
`IsBeingRidden` | Checks whether the actor is currently ridden.
`IsUndead` | Is this an undead actor?
`GetRealHoursPassed` | Return the real hours of playtime passed.
`UnequipAll` | Unequip all worn items from the given actor.
`IsUnlockedDoor` | Is the given reference an unlocked door?
`IsHostileToActor` | Is the given actor hostile to the specified target?
`GetTargetHeight` | Get the delta on z between two references
`IsPoison` | Is the object a Poison potion
`WornApparelHasKeywordCount` | Is the given actor hostile to the specified target?
`GetItemHealthPercent` | Gets the item health for the calling reference.
`EffectWasDualCast` | Checks to see if the effect was dual-cast
`GetKnockStateEnum` | What is the actor's knock state (knock-out, knock-down, etc.) enum value?
`DoesNotExist` | Does the current reference not exist?
`InstantDock` | Instantly dock with another ship, station, or docking port
`GetSpeechChallengeSuccessGame` | Get success value of the player current speaking topic.
`GetActorStance` | Get the actor's stance.
`SpeechScenarioHasKeyword (hsk)` | See if Keyword is in current speech challenge game.
`UnequipItemSlot` | Unequips whichever item is in the current actor's specified slot.
`MountActor` | Mounts an actor.
`DismountActor` | Dismounts an actor.
`CanProduceForWorkshop` | Can the given reference produce resources for Workshop?
`CanFlyHere` | Can the reference actor fly here?
`EPIsDamageType` | Checks to see if one of the ExtraData forms on this actor is a BGSDamageType.
`IsCurrentSpeechChallengeObject` | See if Speech Challenge Object is in current speech challenge game.
`GetActorGunState` | Get the actor's gun state.
`GetVoiceLineLength` | Get the length of the line the actor is saying.
`ModPos` | Modify the position on a reference.
`ObjectTemplateItem_HasKeyword` | Does the current Object Template Item have the given keyword?
`ObjectTemplateItem_HasUniqueKeyword` | Does the current Object Template Item have the given Name?
`ObjectTemplateItem_GetLevel` | What is the current Object Template Item's level?
`MovementIdleMatches` | Checks whether the current large delta state matches the passed in start and end values.
`GetActionData` | Gets the current action data.
`GetActionDataShort` | Gets the current action data as a short.
`GetActionDataByte` | Gets the current action data as a byte.
`GetActionDataFlag` | Gets the current action data as a flag.
`ModdedItemHasKeyword` | Does the modded item have the specified keyword?
`GetAngryWithPlayer (gawp)` | Get the angry with player flag on an actor.
`IsCameraUnderWater` | Is the camera under the water?
`ModAngle` | Modify the angle on a reference.
`IsActorRefOwner` | get the Actor ref ownership of the ref
`HasActorRefOwner` | check whether the ref ever had Actor ownership assigned
`PlaceThere (pt)` | Place a reference at the location in the center of the screen.
`GetLoadedAmmoCount` | Gets the current loaded ammo count of an actor.
`IsTimeSpanSunrise` | Check the current gamehour against the Sunrise timespan.
`IsTimeSpanMorning` | Check the current gamehour against the Morning timespan.
`IsTimeSpanAfternoon` | Check the current gamehour against the Afternoon timespan.
`IsTimeSpanEvening` | Check the current gamehour against the Evening timespan.
`IsTimeSpanSunset` | Check the current gamehour against the Sunset timespan.
`IsTimeSpanNight` | Check the current gamehour against the Night timespan.
`IsTimeSpanMidnight` | Check the current gamehour against the Midnight timespan.
`IsTimeSpanAnyDay` | Check the current gamehour against the Day (any) timespan.
`IsTimeSpanAnyNight` | Check the current gamehour against the Night (any) timespan.
`CurrentFurnitureHasKeyword` | Check if the current furniture has the specified keyword.
`GetWeaponEquipIndex` | Get the actor's weapon equip index.
`KillAllHostile (kah)` | Kills all hostile actors in the immediate area.
`IsOverEncumbered` | Is the actor overencumbered?
`IsPackageRequestingBlockedIdles` | Is the package requesting no idles?
`GetActionDataInt` | Gets the current action data as an int.
`GetVATSRightMinusLeftAreaFree` | Calculates the difference between the right and left area free for playback cameras.
`GetInIronSights` | Returns true if the actor is currently in iron-sights.
`GetActorStaggerDirection` | Get the actor stagger direction.
`GetActorStaggerMagnitude` | Get the actor stagger magnitude.
`WornCoversBipedSlot` | Is the actor wearing anything targeting the specific biped slot?
`GetInventoryValue` | Gets the total value of the inventory of the given ref.
`IsPlayerInConversation` | True if Player is in the current conversation
`IsInDialogueCamera` | True if in the DialogueCamera state
`IsMyDialogueTargetPlayer` | Determine if the actor is currently speaking to the player used for camera.
`IsMyDialogueTargetActor` | Determine if the actor is currently speaking to another actor used for camera.
`GetMyDialogueTargetDistance` | True if in the DialogueCamera state
`IsSeatOccupied` | True if the seat is occupied
`IsPlayerRiding` | True if the player is riding the subject
`IsTryingEventCamera` | True if trying to find/play an event camera
`UseLeftSideCamera` | True if we want a left side camera
`GetNoteType` | Get the type of note a ref is. (0=NT_UNUSED (Formerly NT_SOUND), 1=NT_VOICE, 2=NT_PROGRAM, 3=NT_TERMINAL)
`LocationHasPlayerOwnedWorkshop` | Does the reference object's location have a player-owned Workshop in it?
`IsStartingAction` | Is the actor starting an action?
`IsMidAction` | Is the actor in the middle of an action?
`IsWeaponChargeAttack` | True if currently equipped weapon has a charging attack
`IsInWorkshopMode` | True if the player is in workshop mode
`IsWeaponChargingHoldAttack` | True if currently equipped weapon has an attack charged by holding an input
`IsEncounterAbovePlayerLevel` | True if the ref this is called on is in a zone which is higher than player level.
`IsMeleeAttacking` | See if an actor is melee attacking.
`GetVATSQueuedTargetsUnique` | Returns the number of unique targets in the vats queue.
`GetCurrentLocationExplored` | Is the ref object's current location explored?
`IsPowered` | Indicates whether the selected reference is powered.
`GetTransmitterDistance` | Get the distance from the given radio transmitter ref to the player.
`GetCameraPlaybackTime` | Returns the amount of time since the beginning of dialogue/VATS playback
`IsInWater` | Returns if an actor is in water or not.
`GetWithinActivateDistance` | Checks to see if the called on ref is the given activate distance from the given ref.
`IsUnderWater` | Returns if an actor is under water or not.
`IsInSameSpace` | Returns if two refs are in the space.
`LocationAllowsReset` | Returns if the ref's current location allows reset.
`GetVATSBackRightAreaFree` | Checks if the back right area is unobstructed around an actor.
`GetVATSBackLeftAreaFree` | Checks if the back left area is unobstructed around an actor.
`GetVATSBackRightTargetVisible` | Checks if a target is visible from the back right area of an actor.
`GetVATSBackLeftTargetVisible` | Checks if a target is visible from the back left area of an actor.
`GetVATSTargetLimbVisible` | Checks if a target limb is visible from an actor.
`IsPlayerListening` | Check if the player is currently listening to a given radio frequency.
`GetPathingRequestedQuickTurn` | Should we use a fast turn in place for this actor?
`EPIsCalculatingBaseDamage` | Is base damage being calculated using this entry point?
`GetReanimating` | Check if the actor is reanimating.
`GetCombatDialogueDataInt` | Gets the current Combat dialogue data as an int.
`IsDocked` | Check if a spaceship is docked.
`IsDockedWith` | Check if a spaceship is docked with a specific target
`GetLastDialogueCameraHasKeyword` | 0/1 if last camera exists, -1 if no last camera
`GetActionDataForm` | Gets the current action data as a form and compares it to the parameter.
`IsInSpace` | Is an reference in space.
`GetPilot` | Get the pilot of a spaceship
`GetSpaceship` | Get the spaceship a ref is in
`ShipContainsRef` | Does this spaceship contain a ref (player if no ref given)
`IsInSpaceship` | Is this ref in a spaceship?
`ShipHasActorInPilotSeat` | Is there any actor in the pilot seat of this spaceship?
`ActorPackageHasRandomConversationsFlagOn` | Is this ref allowed random conversation
`GetActorInShipPilotSeat` | Is the ref in this spaceship's pilot seat?
`IsSpaceship` | Check if the ref is a spaceship.
`GetInAcousticSpace` | Is this reference in the given acoustic space?
`CurrentShipLanded` | Check if the ref is on a landed spaceship
`IsDockedAsChild` | Check if a spaceship is docked as a child
`PlayerHailResponse` | Player hail response.
`IsHerdLeader` | Is actor a Leader.
`HasHerdLeader` | Has a herd Leader.
`TrySetPlayerHomeSpaceShip` | Attempt to set Player Home Ship. Returns true if home ship is set.
`GetPlayerHomeSpaceShip` | Get Player Home Ship.
`IsTrueForConditionForm` | See if the condition is true or false for the subject.
`GetNumElementsInRefCollection` | Gets the number of elements in a ref collection
`GetCurrentWeatherHasKeyword` | Check to see if the current weather has the provided keyword.
`IsSnappedTo` | Is the given reference snapped to this other reference?
`HasKeywordOnNode` | Checks for a specific keyword on the node that is snapped to.
`HasKeywordOnStacked` | Checks for a specific keyword on the object I am stacked atop.
`HasVisualDetection` | Checks if an actor has visual detection on another actor
`HasSoundDetection` | Checks if an actor has sound detection on another actor
`IsSuppressed` | Checks if the specified actor is suppressed
`IsSpaceshipEngineDestroyed` | Check if a spaceship's engine is destroyed.
`IsLanded` | Check if the ref is a landed spaceship
`IsSpaceshipShieldsDestroyed` | Check if a spaceship's shields are destroyed.
`IsSpaceshipGravDriveDestroyed` | Check if a spaceship's grav drive is destroyed.
`GetNumberOfSpaceshipWeaponsDestroyed` | Get the number of destroyed spaceship's weapons.
`GetIsCurrentLocationExact` | Is the ref currently in the given location?
`GetIsEditorLocationExact` | Is the ref's editor location in the given location?
`IsInThreatBackdown` | Has the actor already done threadbackdown for current radius reaction?
`IsInsidePrimitive` | Check if the reference is inside a specified primitive.
`GetCameraActorCount` | Returns the number of non-player actors who will talk in the scene
`GetIsCurrentLocationAliasExact` | Is the ref currently in the exact given location of our owner quest?
`IsJailInSystem` | See if the ref's crime faction has a jail in the player's current system.
`BodyHasKeyword` | Does the ref object's current planetary body use the keyword in the parameter data?
`BiomeHasKeyword` | Does the ref object's current biome use the keyword in the parameter data?
`SystemHasKeyword` | Does the ref object's current planetary system use the keyword in the parameter data?
`GetDistanceFromLocationWithKeyword` | Get the distance from the ref to any location with a specific keyword.
`GetPlanetVisited` | Has the ref object's current planet been visited by the player?
`IsLocalDay` | Check if the sun is up on the current planet.
`SpeechChallengePreviousSceneHasKeyword` | Does the last speech challenge scene have a keyword?
`GetBiomeMaskValue` | Get the ref object's biome mask on the terrain at its position.
`BodyIsType` | Check if the planet type for the ref's planet matches the given keyword.
`BodyIsAtmosphereType` | Check if the planet atmosphere type for the ref's planet matches the given keyword.
`BodyIsTemperatureType` | Check if the planet temperature type for the ref's planet matches the given keyword.
`GetBodyTemperature` | Get the planet temperature for the ref's planet.
`GetBodyPressure` | Get the atmosphere pressure for the ref's planet.
`GetBodyGravity` | Get the planet gravity for the ref's planet.
`GetBodySurveyPercent` | Get the planet survey percent for the ref's planet.
`IsPlayerLoitering` | Returns whether the player is loitering or not.
`IsResearchComplete` | Check if a research project is completed.
`BodyIsPlanetTraitKnown` | Does the ref object's current planetary body has a specific planet trait known by the player?
`HasPerkCategory` | Checks if the owner of an activity is a perk of a certain category.
`HasPerkSkillGroup` | Checks if the owner of an activity is a perk of a certain skill group.
`CountAquiredPerkRanksByType` | Gets the total amount of acquired perk ranks.
`IsScanned` | Check if a object has been scanned.
`IsScannableKeywordRevealed` | Check if a scannable object has a piece of information revealed.
`IsMyVictim` | Check if dead actor was killed by this actor or this actor's ally/friend or this actor's herd.
`GetResourceScarcity` | Get produced resource scarcity.
`CheckContrabandStatus` | Retrieve the ship's contraband status.
`StartSequence (ses)` | Starts an EffectSequence on a set of refrs (whose forms have an effect sequence component)
`StopSequence` | Stops all EffectSequences that are attached to a set of refrs
`IsPlayerSpaceFarTravelling` | Check if the player is performing space far travel
`IsPlayerSpaceFarTravelDeparture` | Check if the player is performing space far travel departure.
`IsPlayerSpaceFarTravelArrival` | Check if the player is performing space far travel arrival.
`BiomeHasWeather` | Check if the referenced object's biome has a chance for the given weather.
`ToggleDistantLOD (tdl)` | Toggles the distant LODs
`GetSystemSurveyPercent` | Get the total planet survey percent for the ref's system.
`SystemBodyHasKeyword` | Does the ref object's current planetary system use the given keyword?
`StartSequenceEx (ssx)` | Starts an EffectSequence on a single refr with additional options
`GetShipGroupThreatRatio` | Calculates the threat ratio between the group of pilots defined by the subject's group vs. the group of pilots defined by the target's group.
`IsOnGrazingTerrain` | Is the actor standing on grazing ground?
`GetDistanceGalacticParsec` | Get the distance between two references in parsecs.
`GetDistanceGalacticMegaMeter` | Get the distance between two references in mega meters.
`GetShipToShipGroupThreatRatio` | Calculates the threat ratio between the ship (or pilot) of the subject vs. the group of ships allied to the target.
`GetGroupMembersInRadiusCount` | Check if an AI has any combat group members within the radius.
`GetShipPiracyValue` | Calculates the piracy value of the subject ref vs the target ref's group of allied ships.
`GetDistanceFromCelestialBodyAliasParsecs` | Gets the distance from the given alias in terms of parsecs.
`GetDistanceFromCelestialBodyAliasMegaMeters` | Gets the distance from the given alias in terms of mega meters.
`ForceGPUCrash (FGC)` | Debug function for forcing a GPU crash to occur for testing GPU crash handling.
`IsInsidePrimitiveTopAndBottom` | Check if the reference's top and bottom are in a specified primitive.
`GetPlayerBountyCrimeFaction` | Check the last crime faction for player bounty.
`GetIsFloating` | Gets whether or not the actor is floating.
`LocationOrParentHasKeyword` | Determine if a location, or any of its parent locations, has a keyword.
`IsCelestialBodyScanned (cbscnd)` | Get whether the celestial body is scanned.
`LandAtPlanetMarker (lapm)` | Land on a planet at the specified marker
`IsActorReactionInCooldown (aricd)` | Get whether an actor's reaction is in cooldown or not.
`SetWindowMode (SWM)` | Sets the window mode to one of: WindowedBorderless, FullScreenBorderless, FullScreen, Windowed
`RaytracingVisualization (rv)` | Sets the raytracing visualiation mode.
`ToggleTextureRatio (ttr)` | Toggle Texture Ratio
`BiomeSupportsCreature (bsc)` | Does the actor parameter resolve to a creature in the planet's biome's creature list?
`SetDisplayMonitor (SDM)` | Sets the current display monitor and its display resolution.
`SetWindowSize (SWS)` | Resizes the window to the given width and height.
`EPMagic_SpellHasMagicEffect` | The passed in reference is a temp reference whose referring object is a MagicItem. Does it have the given Magic Effect?
`SetRenderResolutionScale (SRRS)` | Sets the render resolution scale factor.
`IsFacingActor` | Is the actor facing the refr?
`IsSameVoiceType` | Does the reference share a voice type with the specified ref?
`GetValueCurrentLocation (GetAVCL)` | Get an actor value from the reference's current location
`IsBoostPackActive` | Is player's boost pack active?
`GetTimeSinceLastBoostPackEnded` | Get time since last boost pack ended, in seconds.
`EPGetLastCombatHitCritical` | Was the last combat hit we caused a Critical?
`EPGetLastCombatHitKill` | Was the last combat hit we caused a kill?
`EPGetLastCombatHitGunBash` | Was the last combat hit we caused a gun bash?
`EPIsLastCombatHitLimbInCategory` | Check if the last combat hit limb in limb category
`IsEditorLocationInsidePrimitive` | Check if the reference's editor location is inside a specified primitive
`GetIsPronoun` | Does the reference NPC use the given pronoun?
`GetDistanceGalacticLightYears` | Get the distance between two references in lightyears.
`GetDistanceFromCelestialBodyAliasLightyears` | Gets the distance from the given alias in terms of lightyears.
`IsOnPlayerHomeSpaceShip` | Is the ref on the player's home ship?
`EPMagic_EffectHasKeyword` | The passed in reference is a temp reference whose referring object is a Magic Effect. Does the Magic Effect have the given keyword?
`EPMagic_SpellIs` | The passed in reference is a temp reference whose referring object is a MagicItem. Does it match the given Magic Item?
`IsPlayerSteadyingWeapon` | Is the player steadying their weapon?
`ResourceVeinHasKeyword` | Checks to see if the resource produced by the vein where the ref is has the given keyword.
`GetLastCombatHitActorConsecutiveHits` | Get the last combat hit actor consecutive hits.
`GetCurrentAndLastWeatherHaveKeyword` | Check to see if the current and previous weather have the provided keyword.
`IsPCEquippedWeaponNthAttack` | Is this the Nth attack with the currently equipped weapon
`GetWaterDepth` | Get the depth of the water at the position.
`AreHostileActorsNear (ahan)` | Check if hostile actors are near
`GetPlayerGravityScale` | Get the gravity scale for the player, including modifiers
`IsInSameGroup` | Returns true if the actor it is called on is in same herd group.
`IsBoostPackHovering` | Is player's boost pack hovering?
`GetUsedWeightCapacityConditionFunction` | Get the used weight capacity for actors, ships, containers. 1.0f is 100%
`RecalculateTemplatedSpaceship (RTS)` | force a recalculation of a templated spaceship
`BodyHasResource` | Does the ref object's current planetary body have the given resource? Optional integer 1 to include atmospheric resources.
`GetPCIsReloading` | Returns true if the Player is currently reloading.
`ActorExposedToSky` | Test if actor is exposed to sky
`SpawnShip` | Spawn ship instance.
`SpawnSpaceCell` | Spawn Space Cell.
`GetQuetStarting (GetQS)` | Is the given quest starting?
`BodyHasResourceWithKeyword` | Does the ref object's current planetary body have a resource with the given keyword? Optional integer 1 to include atmospheric resources.
`HangMainThread` | Stall the main thread.
`GetShipReactorClass` | Gets a value representing the ship reactor class (based on its index in the ShipClassOrder form list)
`ShipReactorHasClassKeyword` | Check if the reactor of the supplied ship has the provided reactor class keyword (keywords in ShipClassOrder form list)
`ForceCrash` | Trigger various kinds of crash to stress the crash handler. (specify "pv" for pure virtual call, "ip" for invalid parameter, or nothing for a regular access violation)
`EPIsResistanceActorValue` | Is a specific resistance actor value passed into this check?
