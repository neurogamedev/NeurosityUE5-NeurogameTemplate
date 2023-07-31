// Copyright Epic Games, Inc. All Rights Reserved.

#include "NeuroTry01GameMode.h"
#include "NeuroTry01Character.h"
#include "UObject/ConstructorHelpers.h"

ANeuroTry01GameMode::ANeuroTry01GameMode()
{
	// set default pawn class to our Blueprinted character
	static ConstructorHelpers::FClassFinder<APawn> PlayerPawnBPClass(TEXT("/Game/ThirdPerson/Blueprints/BP_ThirdPersonCharacter"));
	if (PlayerPawnBPClass.Class != NULL)
	{
		DefaultPawnClass = PlayerPawnBPClass.Class;
	}
}
